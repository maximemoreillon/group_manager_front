import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    current_user: null,
    tokens: null,
    admins: [],
  },
  mutations: {
    set_current_user(state, user) {
      state.current_user = user?.profile || user;
    },
    set_tokens(state, tokens) {
      state.tokens = tokens;
    },
    set_admins(state, admins) {
      state.admins = admins;
    },
  },
  getters: {
    admin_identifiers: (state) => {
      return new Set(
        state.admins.flatMap((a) =>
          [a._id, a.username].filter(Boolean).map((v) => String(v)),
        ),
      );
    },
    current_user: (state) => {
      return state.current_user.properties || state.current_user;
    },
  },
  actions: {},
  modules: {},
});
