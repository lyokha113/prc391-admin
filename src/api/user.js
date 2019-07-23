import axios from '@/utils/axios'

const API_URL = '/user'

export function login(loginInfo) {
  const request = {
    email: loginInfo.username.trim(),
    password: loginInfo.password
  }
  return axios.post(`/login`, request)
}
