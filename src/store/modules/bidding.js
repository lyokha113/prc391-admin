import {
  getBiddings,
  createBidding,
  updateBidding,
  closeBidding
} from "@/api/bidding";

const state = {
  biddings: []
};

const mutations = {
  SET_BIDDINGS: (state, biddings) => {
    state.biddings = biddings;
  },
  ADD_BIDDING: (state, bidding) => {
    state.biddings.unshift(bidding);
  },
  UPDATE_BIDDING: (state, bidding) => {
    const idx = state.biddings.find(b => b.id === bidding.id);
    Object.assign(idx, bidding);
  }
};

const actions = {
  async getBiddings({ commit }) {
    const { data } = await getBiddings();
    if (data.success) {
      commit("SET_BIDDINGS", data.data);
    }
  },
  async createBidding({ commit }, bidding) {
    const { data } = await createBidding(bidding);
    if (data.success) {
      commit("ADD_BIDDING", data.data);
      return true;
    } else {
      return false;
    }
  },
  async updateBidding({ commit }, bidding) {
    const { data } = await updateBidding(bidding);
    if (data.success) {
      commit("UPDATE_BIDDING", bidding);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
