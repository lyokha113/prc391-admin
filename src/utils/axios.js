import axios from 'axios';
import store from '@/store';
import { getToken } from '@/utils/auth';

const API_DOMAIN = 'http://localhost:5000';

const service = axios.create({
  baseURL: API_DOMAIN,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': 'application/json'
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['AUTHORIZATION'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

export default service
