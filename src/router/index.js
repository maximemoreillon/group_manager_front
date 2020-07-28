import Vue from 'vue'
import VueRouter from 'vue-router'
import Groups from '../views/Groups.vue'
import Group from '../views/Group.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'groups',
    component: Groups
  },
  {
    path: '/groups/:group_id',
    name: 'group',
    component: Group,
    alias: '/group',
  },
  {
    path: '*',
    redirect: {name :'groups'}
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
