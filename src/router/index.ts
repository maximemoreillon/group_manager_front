import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'UserGroups', params: { user_id: 'self' } },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/oidc-callback',
      name: 'OidcCallback',
      component: () => import('../views/OidcCallback.vue'),
      meta: { public: true },
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

router.beforeEach(async (to) => {
  const { tokens, identify } = useAuth()

  if (to.meta.public) {
    // Redirect away from login if already authenticated
    if (to.name === 'Login' && tokens.value) {
      return { name: 'UserGroups', params: { user_id: 'self' } }
    }
    return true
  }

  if (tokens.value) return true

  const success = await identify()
  if (success) return true

  return { name: 'Login', query: { redirect: to.fullPath } }
})

export default router
