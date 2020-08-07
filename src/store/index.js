import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    current_user: null,
  },
  mutations: {
    set_current_user (state, current_user) {
      state.current_user = current_user
    }
  },
  actions: {
  },
  modules: {
  }
})
