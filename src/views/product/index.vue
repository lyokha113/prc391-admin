<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.status"
        placeholder="Product status"
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
      >Create Product</el-button>
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

      <el-table-column label="Name" :min-width="15">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Price" :min-width="15">
        <template slot-scope="scope">
          <span>{{ scope.row.price | priceFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Description" :min-width="34">
        <template slot-scope="scope">
          <span
            style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
          >{{ scope.row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Images" :min-width="10">
        <template slot-scope="scope">
          <span
            class="link-type"
            @click="handleImageDialog(scope.row)"
          >{{ scope.row.images | imageFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" :min-width="8">
        <template slot-scope="{row}">
          <el-tag :type="row.active | statusTagFilter">{{ row.active | statusFilter }}</el-tag>
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
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="temp.description" />
        </el-form-item>
        <el-form-item label="Price" prop="price">
          <el-input-number v-model="temp.price" :min="100000" :step="10000" step-strictly></el-input-number>
        </el-form-item>
        <el-form-item label="Category">
          <el-select v-model="temp.categoryId" class="filter-item" placeholder="Please select">
            <el-option
              v-for="category in categories.filter(p => p.active)"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false" :disabled="btnLoading">Cancel</el-button>
        <el-button
          type="primary"
          :loading="btnLoading"
          @click="dialogStatus==='Create new product'?createData():updateData()"
        >Confirm</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="Product images"
      :visible.sync="dialogImageVisible"
      :show-close="false"
      :close-on-click-modal="false"
      width="400px"
    >
      <el-upload
        ref="upload"
        action
        list-type="picture"
        class="upload-demo"
        drag
        multiple
        :file-list="uploadedImgs"
        :http-request="handleUpload"
        :on-remove="handleRemove"
        :on-preview="handlePreview"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          Drop file here or
          <em>click to upload</em>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogImageVisible = false">Cancel</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPreviewImgVisible">
      <img width="100%" :src="previewImgUrl" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Pagination from "@/components/Pagination";

export default {
  name: "ProductTable",
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
    imageFilter(image) {
      if (image == null) return "0 image";
      const count = image.length;
      return count > 1 ? count + " images" : count + " image";
    },
    priceFilter(price) {
      const regex = /\B(?=(\d{3})+(?!\d))/g;
      return price.toString().replace(regex, ".") + " VNĐ";
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
        name: "",
        description: "",
        price: 100000,
        categoryId: undefined,
        active: true
      },
      uploadedImgs: [],
      selectedProduct: undefined,
      statusTypeOption,
      dialogImageVisible: false,
      dialogPreviewImgVisible: false,
      dialogFormVisible: false,
      dialogStatus: "",
      previewImgUrl: "",
      btnLoading: false,
      rules: {
        name: [
          {
            required: true,
            message: "Can't be empty",
            trigger: "blur"
          }
        ],
        description: [
          {
            required: true,
            message: "Can't be empty",
            trigger: "blur"
          }
        ],
        price: [
          {
            type: "number",
            min: 100000,
            max: 100000000000000,
            message: "Please input correct price",
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
      categories: "categories"
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
      await this.$store.dispatch("category/getCategories");
      this.list = this.products;
      this.total = this.list.length;
      this.listLoading = false;
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "Create new product";
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
            "product/createProduct",
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
      this.temp.categoryId = this.temp.category.id;
      console.log(this.temp);
      this.dialogStatus = "Update Product";
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
            "product/updateProduct",
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
    async handleModifyStatus(row, status) {
      this.btnLoading = true;
      this.temp = Object.assign({}, row);
      this.temp.active = status;
      const result = await this.$store.dispatch(
        "product/updateProduct",
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
    handleImageDialog(row) {
      if (row.images != null) {
        this.uploadedImgs = row.images.map(i => {
          return {
            name: i.id,
            url: i.image
          };
        });
      } else {
        this.uploadedImgs = [];
      }
      this.selectedProduct = row.id;
      this.dialogImageVisible = true;
    },
    async handleUpload(param) {
      param.productId = this.selectedProduct;
      await this.$store.dispatch("product/createImage", param);
    },
    async handleRemove(file, fileList) {
      const product = "/p" + this.selectedProduct + "/";
      const idIdx = file.url.indexOf(product);
      const endIdx = file.url.indexOf("?GoogleAccessId");
      const fileName = file.url.substring(idIdx + product.length, endIdx);
      const request = {
        productId: this.selectedProduct,
        imageId: file.name,
        fileName: fileName
      };
      await this.$store.dispatch("product/removeImage", request);
    },
    handlePreview(file) {
      this.previewImgUrl = file.url;
      this.dialogPreviewImgVisible = true;
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: "",
        description: "",
        price: 100000,
        categoryId: undefined,
        active: true
      };
    },
    handleFilter() {
      this.list = this.products.filter(
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


