import axios from '@/utils/axios';

const API_URL = '/product';

export function getProducts() {
  return axios.get(`${API_URL}`)
}

export function createProduct(product) {
  return axios.post(`${API_URL}`, product)
}

export function updateProduct(product) {
  return axios.put(`${API_URL}/${product.id}`, product)
}

export function createImage(image) {
  return axios.post(`${API_URL}/image/create`, image)
}

export function removeImage(image) {
  return axios.post(`${API_URL}/image/remove`, image)
}
