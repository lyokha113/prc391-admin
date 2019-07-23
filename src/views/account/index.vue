<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.filter"
        placeholder="Role"
        clearable
        class="filter-item"
        style="width: 200px"
        @change="handleFilter"
      >
        <el-option
          v-for="role in filterTypeOptions"
          :key="role.value"
          :label="role.name"
          :value="role.value"
        />
      </el-select>
    </div>

    <el-table
      v-loading="listLoading"
      :data="pagedList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="index" />

      <el-table-column label="Full Name" :min-width="15">
        <template slot-scope="scope">
          <span>{{ scope.row.fullName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Email" :min-width="20">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Address" :min-width="20">
        <template slot-scope="scope">
          <span>{{ scope.row.address }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Role" :min-width="9">
        <template slot-scope="scope">
          <span>{{ scope.row.role.name | roleFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" :min-width="8">
        <template slot-scope="{row}">
          <el-tag :type="row.active | statusTagFilter">{{ row.active | statusFilter}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Action"
        align="center"
        class-name="small-padding fixed-width"
        :min-width="13"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">Edit</el-button>
          <el-button
            v-if="!row.active"
            size="mini"
            type="success"
            :loading="btnLoading"
            @click="handleModifyStatus(row, true)"
          >Unlock</el-button>
          <el-button
            v-if="row.active"
            size="mini"
            type="danger"
            :loading="btnLoading"
            @click="handleModifyStatus(row, false)"
          >Lock</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="handlePagingation"
    />

    <el-dialog
      title="Update Acount"
      :visible.sync="dialogFormVisible"
      width="500px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="200px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="Address" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="temp.roleId" class="filter-item" placeholder="Please select">
            <el-option
              v-for="role in filterTypeOptions"
              :key="role.value"
              :label="role.name"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" :disabled="btnLoading">Cancel</el-button>
        <el-button type="primary" :loading="btnLoading" @click="updateData">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Pagination from "@/components/Pagination";

export default {
  name: "AccountTable",
  components: { Pagination },
  filters: {
    statusTagFilter(status) {
      const statusMap = {
        true: "success",
        false: "info"
      };
      return statusMap[status];
    },
    statusFilter(status) {
      const statusMap = {
        true: "Active",
        false: "Locked"
      };
      return statusMap[status];
    },
    roleFilter(role) {
      return role.charAt(0) + role.slice(1).toLowerCase();
    }
  },
  data() {
    const filterTypeOptions = [
      { name: "Administrator", value: 1 },
      { name: "Customer", value: 2 }
    ];

    return {
      total: 0,
      temp: {
        address: "",
        role: undefined
      },
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        limit: 10,
        filter: ""
      },
      filterTypeOptions,
      dialogFormVisible: false,
      btnLoading: false
    };
  },
  created() {
    this.fetchData();
  },
  computed: {
    ...mapGetters({
      accounts: "accounts"
    }),
    pagedList() {
      const idx = this.listQuery.page - 1;
      const item = idx * this.listQuery.size;
      return this.list.slice(item, item + this.listQuery.size);
    }
  },
  methods: {
    async fetchData() {
      this.listLoading = true;
      await this.$store.dispatch("account/getAccounts");
      this.list = this.accounts;
      this.total = this.list.length;
      this.listLoading = false;
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row);
      this.temp.roleId = row.role.id;
      this.dialogFormVisible = true;
    },
    async updateData() {
      this.btnLoading = true;
      const result = await this.$store.dispatch(
        "account/updateAccount",
        this.temp
      );
      this.btnLoading = false;
      this.dialogFormVisible = false;
      this.$notify({
        title: "Success",
        message: "Updated successfully",
        type: "success",
        duration: 2000
      });
    },
    async handleModifyStatus(row, status) {
      this.btnLoading = true;
      this.temp = Object.assign({}, row);
      this.temp.roleId = row.role.id;
      this.temp.active = status;
      const result = await this.$store.dispatch(
        "account/updateAccount",
        this.temp
      );
      this.$notify({
        title: "Success",
        message: "Updated successfully",
        type: "success",
        duration: 2000
      });
      this.btnLoading = false;
    },
    handleFilter() {
      this.list = this.accounts.filter(
        p => this.listQuery.filter == "" || this.listQuery.filter == p.role.id
      );

      this.total = this.list.length;
      this.listQuery.page = 1;
    },
    handlePagingation(page) {
      this.listQuery.size = page.limit;
      this.listQuery.page = page.page;
    }
  }
};
</script>
