import { getCategories, createCategory, updateCategory } from '@/api/category'

const state = {
  categories: []
}

const mutations = {
  SET_CATEGORIES: (state, categories) => {
    state.categories = categories
  },
  ADD_CATEGORY: (state, category) => {
    state.categories.unshift(category)
  },
  UPDATE_CATEGORY: (state, category) => {
    const idx = state.categories.find(a => a.id === category.id)
    Object.assign(idx, category)
  }
}

const actions = {
  async getCategories({ commit }) {
    const { data } = await getCategories()
    if (data.success) {
      commit('SET_CATEGORIES', data.data)
    }
  },
  async createCategory({ commit }, category) {
    const { data } = await createCategory(category)
    if (data.success) {
      commit('ADD_CATEGORY', data.data)
      return true
    } else {
      return false
    }
  },
  async updateCategory({ commit }, category) {
    const { data } = await updateCategory(category)
    if (data.success) {
      commit('UPDATE_CATEGORY', category)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
