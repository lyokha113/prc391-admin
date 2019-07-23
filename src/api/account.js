import axios from '@/utils/axios'

const API_URL = '/account'

export function getAccounts() {
  return axios.get(`${API_URL}`)
}

export function getAccount(id) {
  return axios.get(`${API_URL}/${id}`)
}

export function createAccount(account) {
  return axios.post(`${API_URL}`, account)
}

export function updateAccount(account) {
  return axios.put(`${API_URL}/${account.id}`, account)
}
