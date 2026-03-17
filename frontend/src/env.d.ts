/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_LINK_GITHUB?: string
  readonly VITE_LINK_INSTAGRAM?: string
  readonly VITE_LINK_LINKEDIN?: string
  readonly VITE_LINK_LINKEDIN_SKILLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
