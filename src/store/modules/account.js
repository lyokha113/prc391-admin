import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount
} from '@/api/account'

const state = {
  accounts: []
}

const mutations = {
  SET_ACCOUNT: (state, accounts) => {
    state.accounts = accounts
  },
  ADD_ACCOUNT: (state, account) => {
    state.accounts.unshift(account)
  },
  UPDATE_ACCOUNT: (state, account) => {
    const idx = state.accounts.find(a => a.id === account.id)
    if (account.roleId == 1) {
      account.role.id = 1
      account.role.name = 'ADMINISTRATOR'
    } else {
      account.role.id = 2
      account.role.name = 'CUSTOMER'
    }
    Object.assign(idx, account)
  }
}

const actions = {
  async getAccounts({ commit }) {
    const { data } = await getAccounts()
    if (data.success) {
      commit('SET_ACCOUNT', data.data)
    }
  },
  async createAccount({ commit }, account) {
    const { data } = await createAccount(account)
    if (data.success) {
      commit('ADD_ACCOUNT', data.data)
      return true
    } else {
      return false
    }
  },
  async updateAccount({ commit }, account) {
    const { data } = await updateAccount(account)
    if (data.success) {
      commit('UPDATE_ACCOUNT', account)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
