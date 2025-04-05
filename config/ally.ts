import env from '#start/env'
import { defineConfig, services } from '@adonisjs/ally'

const allyConfig = defineConfig({
  github: services.github({
    clientId: env.get('GITHUB_CLIENT_ID'),
    clientSecret: env.get('GITHUB_CLIENT_SECRET'),
    callbackUrl:
      env.get('NODE_ENV') === 'production'
        ? 'http://localhost:3333/auth/github/callback'
        : 'http://localhost:3333/auth/github/callback',
  }),
  google: services.google({
    clientId: env.get('GOOGLE_CLIENT_ID'),
    clientSecret: env.get('GOOGLE_CLIENT_SECRET'),
    callbackUrl:
      env.get('NODE_ENV') === 'production'
        ? 'http://localhost:3333/auth/google/callback'
        : 'http://localhost:3333/auth/google/callback',
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
