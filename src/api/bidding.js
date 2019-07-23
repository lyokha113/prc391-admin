import axios from '@/utils/axios'

const API_URL = '/bidding'

export function getBiddings() {
  return axios.get(`/admin${API_URL}`)
}

export function createBidding(bidding) {
  return axios.post(`${API_URL}`, bidding)
}

export function updateBidding(bidding) {
  return axios.put(`${API_URL}/${bidding.id}`, bidding)
}

export function closeBidding(bidding) {
  return axios.put(`${API_URL}/close/${bidding.id}`)
}
