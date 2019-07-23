import axios from '@/utils/axios'

const API_URL = '/category'

export function getCategories() {
  return axios.get(`${API_URL}`)
}

export function createCategory(category) {
  return axios.post(`${API_URL}`, category)
}

export function updateCategory(category) {
  return axios.put(`${API_URL}/${category.id}`, category)
}
