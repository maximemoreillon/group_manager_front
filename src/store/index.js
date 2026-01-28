import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    current_user: null,
    tokens: null,
  },
  mutations: {
    set_current_user(state, user) {
      if (!user) {
        state.current_user = null;
        return;
      }

      state.current_user = user.profile || user;
    },
    set_tokens(state, tokens) {
      state.tokens = tokens;
    },
  },
  actions: {},
  modules: {},
});
