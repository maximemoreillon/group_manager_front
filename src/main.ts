import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import '@moreillon/group-manager-vue-picker/styles.css'

createApp(App).use(router).use(vuetify).use(i18n).mount('#app')
