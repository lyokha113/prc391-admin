<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.status"
        placeholder="Category status"
        clearable
        class="filter-item"
        style="width: 200px"
        @change="handleFilter"
      >
        <el-option
          v-for="role in statusTypeOption"
          :key="role.value"
          :label="role.name"
          :value="role.value"
        />
      </el-select>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >Create Category</el-button>
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

      <el-table-column label="Name" :min-width="70">
        <template slot-scope="{row}">
          <template v-if="row.edit">
            <el-input v-model="row.name" class="edit-input" size="small" style="width: 85%" />
            <el-button
              class="cancel-btn"
              size="small"
              icon="el-icon-refresh"
              type="warning"
              @click="cancelEdit(row)"
            >Cancel</el-button>
          </template>
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" :min-width="10">
        <template slot-scope="{row}">
          <el-tag :type="row.active | statusTagFilter">{{ row.active | statusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Action"
        align="center"
        class-name="small-padding fixed-width"
        :min-width="20"
      >
        <template slot-scope="{row}">
          <el-button
            v-if="row.edit"
            type="success"
            size="mini"
            icon="el-icon-circle-check-outline"
            @click="confirmEdit(row)"
          >OK</el-button>
          <el-button
            v-else
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="row.edit=!row.edit"
          >Edit</el-button>
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
      title="Create Category"
      :visible.sync="dialogFormVisible"
      width="500px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="200px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" :disabled="btnLoading">Cancel</el-button>
        <el-button type="primary" :loading="btnLoading" @click="createData">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Pagination from "@/components/Pagination";

export default {
  name: "CategoryTable",
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
    }
  },
  data() {
    const statusTypeOption = [
      { name: "Active", value: "true" },
      { name: "Locked", value: "false" }
    ];

    return {
      total: 0,
      temp: {
        id: undefined,
        name: ""
      },
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        limit: 10,
        status: undefined
      },
      statusTypeOption,
      dialogFormVisible: false,
      btnLoading: false,
      rules: {
        name: [
          {
            required: true,
            message: "Can't be empty",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.fetchData();
  },
  computed: {
    ...mapGetters({
      categories: "categories"
    }),
    pagedList() {
      const idx = this.listQuery.page - 1;
      const item = idx * this.listQuery.size;
      return this.list
        .map(v => {
          if (v.edit == undefined) {
            this.$set(v, "edit", false);
            v.originalName = v.name;
          }
          return v;
        })
        .slice(item, item + this.listQuery.size);
    }
  },
  methods: {
    async fetchData() {
      this.listLoading = true;
      await this.$store.dispatch("category/getCategories");
      this.list = this.categories;
      this.total = this.list.length;
      this.listLoading = false;
    },
    handleCreate() {
      this.temp = {};
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(async valid => {
        if (valid) {
          this.btnLoading = true;
          const result = await this.$store.dispatch(
            "category/createCategory",
            this.temp
          );
          this.btnLoading = false;
          this.dialogFormVisible = false;
          this.$notify({
            title: result ? "Success" : "Error",
            message: result ? "Created successfully" : "Created failed",
            type: result ? "success" : "error",
            duration: 2000
          });
        }
      });
    },
    async handleModifyStatus(row, status) {
      this.btnLoading = true;
      this.temp = Object.assign({}, row);
      this.temp.active = status;
      const result = await this.$store.dispatch(
        "category/updateCategory",
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
    cancelEdit(row) {
      row.name = row.originalName;
      row.edit = false;
      this.$notify({
        message: "The name has been restored to the original value",
        type: "warning"
      });
    },
    async confirmEdit(row) {
      row.edit = false;
      if (row.name) {
        row.originalName = row.name;
        const result = await this.$store.dispatch(
          "category/updateCategory",
          row
        );
        this.$notify({
          title: "Success",
          message: "Updated successfully",
          type: "success",
          duration: 2000
        });
      } else {
        this.$notify({
          message:
            "Can't be empty. The name has been restored to the original value",
          type: "warning"
        });
      }
    },
    handleFilter() {
      this.list = this.categories.filter(
        p =>
          this.listQuery.status == "" ||
          this.listQuery.status == String(p.active)
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
