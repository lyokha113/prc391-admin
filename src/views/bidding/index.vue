<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >Create Bidding</el-button>
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

      <el-table-column label="ID" :min-width="8">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Current Price" :min-width="12">
        <template slot-scope="scope">
          <span>{{ scope.row.currentPrice | priceFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Product" :min-width="25">
        <template slot-scope="scope">
          <span>{{ scope.row.product.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Start" :min-width="12">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime | dateFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="End" :min-width="12">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime | dateFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Expired" class-name="status-col" :min-width="8">
        <template slot-scope="{row}">
          <el-tag :type="row.expired | statusTagFilter">{{ row.expired | statusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Finished" class-name="status-col" :min-width="8">
        <template slot-scope="{row}">
          <el-tag :type="row.finished | statusTagFilter">{{ row.finished | statusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Action"
        align="center"
        class-name="small-padding fixed-width"
        :min-width="15"
      >
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">Edit</el-button>
          <!-- <el-button
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
          >Lock</el-button>-->
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
      :title="dialogStatus"
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
        <el-form-item label="Product">
          <el-select v-model="temp.productId" class="filter-item" placeholder="Please select">
            <el-option
              v-for="product in products.filter(p => p.active)"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Duration (hour)" prop="price">
          <el-input-number v-model="temp.duration" :min="1" :step="1" step-strictly></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" :disabled="btnLoading">Cancel</el-button>
        <el-button
          type="primary"
          :loading="btnLoading"
          @click="dialogStatus==='Create new bidding'?createData():updateData()"
        >Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Pagination from "@/components/Pagination";

export default {
  name: "BiddingTable",
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
        true: "YES",
        false: "NO"
      };
      return statusMap[status];
    },
    priceFilter(price) {
      const regex = /\B(?=(\d{3})+(?!\d))/g;
      return price.toString().replace(regex, ".") + " VNĐ";
    },
    dateFilter(date) {
      const d = new Date(date);
      return d.toLocaleString("vi-VN", { timeZone: "UTC" });
    }
  },
  data() {
    const statusTypeOption = [
      { name: "Active", value: "true" },
      { name: "Locked", value: "false" }
    ];

    return {
      total: 0,
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        limit: 10,
        status: undefined
      },
      temp: {
        id: undefined,
        productId: undefined,
        duration: 1,
        active: true
      },
      statusTypeOption,
      dialogFormVisible: false,
      dialogStatus: "",
      btnLoading: false,
      rules: {
        price: [
          {
            type: "number",
            min: 1,
            max: 1000,
            message: "Please input correct hours",
            trigger: "change"
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
      products: "products",
      biddings: "biddings"
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
      await this.$store.dispatch("product/getProducts");
      await this.$store.dispatch("bidding/getBiddings");
      console.log(this.biddings);
      this.list = this.biddings;
      this.total = this.list.length;
      this.listLoading = false;
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "Create new bidding";
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
            "bidding/createBidding",
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row);
      this.temp.productId = this.temp.product.id;
      this.dialogStatus = "Update bidding";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(async valid => {
        if (valid) {
          this.btnLoading = true;
          const result = await this.$store.dispatch(
            "bidding/updateBidding",
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
        }
      });
    },
    // async handleModifyStatus(row, status) {
    //   this.btnLoading = true;
    //   this.temp = Object.assign({}, row);
    //   this.temp.active = status;
    //   const result = await this.$store.dispatch(
    //     "product/updateProduct",
    //     this.temp
    //   );
    //   this.$notify({
    //     title: "Success",
    //     message: "Updated successfully",
    //     type: "success",
    //     duration: 2000
    //   });
    //   this.btnLoading = false;
    // },
    resetTemp() {
      this.temp = {
        id: undefined,
        productId: undefined,
        duration: 1,
        active: true
      };
    },
    handlePagingation(page) {
      this.listQuery.size = page.limit;
      this.listQuery.page = page.page;
    }
  }
};
</script>
