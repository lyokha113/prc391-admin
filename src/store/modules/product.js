import {
  getProducts,
  createProduct,
  updateProduct,
  createImage,
  removeImage
} from '@/api/product'
import { isDate } from 'util'

const state = {
  products: []
}

const mutations = {
  SET_PRODUCTS: (state, products) => {
    state.products = products
  },
  ADD_PRODUCT: (state, product) => {
    state.products.unshift(product)
  },
  UPDATE_PRODUCT: (state, product) => {
    const idx = state.products.find(p => p.id === product.id)
    Object.assign(idx, product)
  },
  ADD_IMAGE: (state, product) => {
    const idx = state.products.find(p => p.id === product.id)
    idx.images.unshift(product.image)
  },
  REMOVE_IMAGE: (state, request) => {
    const idx = state.products.find(p => p.id === request.productId)
    idx.images = idx.images.filter(i => i.id !== request.imageId)
  }
}

const actions = {
  async getProducts({ commit }) {
    const { data } = await getProducts()
    if (data.success) {
      commit('SET_PRODUCTS', data.data)
    }
  },
  async createProduct({ commit }, product) {
    const { data } = await createProduct(product)
    if (data.success) {
      commit('ADD_PRODUCT', data.data)
      return true
    } else {
      return false
    }
  },
  async updateProduct({ commit }, product) {
    const { data } = await updateProduct(product)
    if (data.success) {
      commit('UPDATE_PRODUCT', product)
    }
  },
  async createImage({ commit }, param) {
    const formData = new FormData()
    formData.append('file', param.file, param.file.uid)
    formData.set('product', param.productId)
    const { data } = await createImage(formData)
    if (data.success) {
      const product = {
        id: param.productId,
        image: data.data
      }
      commit('ADD_IMAGE', product)
    }
  },
  async removeImage({ commit }, request) {
    const { data } = await removeImage(request)
    if (data.success) {
      commit('REMOVE_IMAGE', request)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
