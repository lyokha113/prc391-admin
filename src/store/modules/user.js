import { login } from '@/api/user'
import { removeToken, setToken, decodeToken, getToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  id: '',
  email: '',
  fullName: '',
  address: '',
  phone: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_FULLNAME: (state, fullName) => {
    state.fullName = fullName
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_ADDRESS: (state, address) => {
    state.address = address
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  async login({ commit }, loginInfo) {
    const { data } = await login(loginInfo)
    if (data.success) {
      commit('SET_TOKEN', data.data.accessToken)
      setToken(data.data.accessToken)
    }
  },

  async getInfo({ commit, state }) {
    const decoded = decodeToken(state.token)
    commit('SET_ID', decoded.id)
    commit('SET_FULLNAME', decoded.fullName)
    commit('SET_EMAIL', decoded.email)
    commit('SET_ADDRESS', decoded.address)
    commit('SET_PHONE', decoded.phone)
    commit('SET_ROLES', [decoded.role.name])
  },

  async logout({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_ID', '')
    commit('SET_FULLNAME', '')
    commit('SET_EMAIL', '')
    commit('SET_ADDRESS', '')
    commit('SET_PHONE', '')
    commit('SET_ROLES', [])
    removeToken()
    resetRouter()
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
