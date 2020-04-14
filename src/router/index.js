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
    path: '/group',
    name: 'group',
    component: Group
  }
  /*
  {
    path: '/group',
    name: 'group',
    component: () => import('../views/Group.vue')
  }
  */
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
