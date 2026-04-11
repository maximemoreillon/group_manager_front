import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'UserGroups', params: { user_id: 'self' } },
    },
    {
      path: '/groups/new',
      name: 'CreateGroup',
      component: () => import('../views/CreateGroup.vue'),
    },
    {
      path: '/groups',
      name: 'Groups',
      component: () => import('../views/Groups.vue'),
    },
    {
      path: '/groups/:group_id',
      name: 'Group',
      component: () => import('../views/Group.vue'),
    },
    {
      path: '/users/:user_id/groups',
      name: 'UserGroups',
      component: () => import('../views/UserGroups.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/About.vue'),
    },
  ],
})

export default router
