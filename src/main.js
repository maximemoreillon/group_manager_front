import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

Vue.use(VueAxios, axios)
Vue.use(VueCookies)

Vue.config.productionTip = false


router.beforeEach((to, from, next) => {
  var jwt = Vue.$cookies.get("jwt")
  if(jwt) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
    next();
  }
  else {
    delete axios.defaults.headers.common['Authorization']
    window.location.href = process.env.VUE_APP_AUTHENTICATION_MANAGER_FRONT_URL;
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
