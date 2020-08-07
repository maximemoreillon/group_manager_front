import Vue from 'vue'
import VueRouter from 'vue-router'
import Groups from '../views/Groups.vue'
import Group from '../views/Group.vue'

Vue.use(VueRouter)

const routes = [
  /*
  {
    path: '/',
    name: 'groups',
    component: Groups
  },
  */
  {
    path: '/users/:user_id/groups',
    name: 'groups_of_user',
    component: Groups,
    alias: '/members/:member:id/groups'
  },
  {
    path: '/groups/:group_id',
    name: 'group',
    component: Group,
    alias: '/group',
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '*',
    redirect: {name :'groups_of_user', params: {user_id: 'self'}}
  }


]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
