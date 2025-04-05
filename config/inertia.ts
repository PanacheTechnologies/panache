import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) => ctx.inertia.always(() => ctx.auth?.user),
    flashMessages: (ctx) => ctx.inertia.always(() => ctx.session?.flashMessages || {}),
    errors: (ctx) => ctx.inertia.always(() => ctx.session?.flashMessages?.get('errors') || {}),
    path: (ctx) => ctx.inertia.always(() => ctx.request.url()),
    query: (ctx) => ctx.inertia.always(() => ctx.request.qs()),
    params: (ctx) => ctx.inertia.always(() => ctx.params),
    route: (ctx) => ctx.inertia.always(() => ctx.route?.name),
    publications: (ctx) =>
      ctx.inertia.always(async () => {
        if (ctx.auth?.isAuthenticated) {
          const publications = await ctx.auth.user?.related('publications').query()
          return publications
        }
        return []
      }),
    currentPublication: (ctx) =>
      ctx.inertia.always(async () => {
        if (ctx.auth?.isAuthenticated && ctx.params.slug) {
          const publication = await ctx.auth.user
            ?.related('publications')
            .query()
            .orderBy('createdAt', 'desc')
            .where('slug', ctx.params.slug)
            .first()
          return publication
        }
        return null
      }),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
