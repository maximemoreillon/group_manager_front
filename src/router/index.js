import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [

  {
    path: '/groups',
    alias: '/',
    name: 'Groups',
    component: () => import('../views/Groups.vue'),
  },
  {
    path: '/groups/new',
    name: 'CreateGroup',
    component: () => import('../views/CreateGroup.vue')
  },
  {
    path: '/groups/:group_id',
    name: 'Group',
    component: () => import('../views/Group.vue')
  },
  {
    path: '/users/:user_id/groups',
    name: 'UserGroups',
    component: () => import('../views/UserGroups.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
