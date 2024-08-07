import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import vuetify from "./plugins/vuetify"
import axios from "axios"
import VueAxios from "vue-axios"
import i18n from "./plugins/i18n"

axios.defaults.baseURL = process.env.VUE_APP_GROUP_MANAGER_API_URL

Vue.use(VueAxios, axios)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app")
