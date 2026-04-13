/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROUP_MANAGER_API_URL: string
  readonly VITE_LOGIN_URL: string
  readonly VITE_IDENTIFICATION_URL: string
  readonly VITE_HOMEPAGE_URL: string
  readonly VITE_LOGIN_HINT: string
  readonly VITE_OIDC_AUTHORITY: string
  readonly VITE_OIDC_CLIENT_ID: string
  readonly VITE_OIDC_AUDIENCE: string
  readonly VITE_OIDC_SCOPE: string
  readonly VITE_USER_MANAGER_FRONT_URL: string
  readonly VITE_I18N_LOCALE: string
  readonly VITE_I18N_FALLBACK_LOCALE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
