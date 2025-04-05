/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import env from './env.js'
import { middleware } from './kernel.js'
import './routes/publication.js'

router.on('/').renderInertia('product').as('product')
router.on('/pricing').renderInertia('pricing').as('pricing')
router.on('/legal/privacy-policy').renderInertia('legal/privacy-policy').as('legal.privacy-policy')
router
  .on('/legal/terms-of-service')
  .renderInertia('legal/terms-of-service')
  .as('legal.terms-of-service')

router.get('/contact', ({ inertia }) => inertia.render('contact'))
router.post('/contact', async ({ request, response }) => {
  const { email, message } = request.body()
  try {
    await fetch(env.get('DISCORD_WEBHOOK_URL'), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify({
        content: `Email: ${email}\n\nMessage: ${message}`,
      }),
    })
  } catch (error) {
    console.error(error)
  }
  return response.redirect().back()
})

router.on('/onboarding').renderInertia('onboarding').as('onboarding').use(middleware.auth())

/**
 * ------------------------------------------------------------
 * Authentication Routes
 * ------------------------------------------------------------
 */

const SignUpController = () => import('#controllers/auth/sign-up-controller')
router.get('/auth/sign-up', [SignUpController, 'show']).as('auth.sign-up.show')
router.post('/auth/sign-up', [SignUpController, 'handle']).as('auth.sign-up.handle')

const SignInController = () => import('#controllers/auth/sign-in-controller')
router.get('/auth/sign-in', [SignInController, 'show']).as('auth.sign-in.show')
router.post('/auth/sign-in', [SignInController, 'handle']).as('auth.sign-in.handle')

const SignOutController = () => import('#controllers/auth/sign-out-controller')
router.post('/auth/sign-out', [SignOutController, 'handle']).as('auth.sign-out.handle')

const ForgotPasswordController = () => import('#controllers/auth/forgot-password-controller')
router
  .get('/auth/forgot-password', [ForgotPasswordController, 'show'])
  .as('auth.forgot-password.show')
router
  .post('/auth/forgot-password', [ForgotPasswordController, 'handle'])
  .as('auth.forgot-password.handle')

const ResetPasswordController = () => import('#controllers/auth/reset-password-controller')
router.get('/auth/reset-password', [ResetPasswordController, 'show']).as('auth.reset-password.show')
router
  .post('/auth/reset-password', [ResetPasswordController, 'handle'])
  .as('auth.reset-password.handle')

const OAuthController = () => import('#controllers/auth/oauth-controller')
router.get('/auth/:provider/redirect', [OAuthController, 'redirect']).as('auth.oauth.redirect')
router.get('/auth/:provider/callback', [OAuthController, 'callback']).as('auth.oauth.callback')

/**
 * ------------------------------------------------------------
 * Editor Routes
 * ------------------------------------------------------------
 */
const PublicationsController = () => import('#controllers/editor/publications-controller')
router
  .get('/publications', [PublicationsController, 'index'])
  .as('editor.publications.index')
  .use(middleware.auth())
router
  .get('/publications/create', [PublicationsController, 'create'])
  .use(middleware.auth())
  .as('editor.publications.create')
router
  .get('/publications/:slug', [PublicationsController, 'show'])
  .use(middleware.auth())
  .as('editor.publications.show')
router
  .post('/publications', [PublicationsController, 'store'])
  .use(middleware.auth())
  .as('editor.publications.store')

router
  .patch('/publications/:slug', [PublicationsController, 'update'])
  .use(middleware.auth())
  .as('editor.publications.update')

router
  .delete('/publications/:id', [PublicationsController, 'destroy'])
  .use(middleware.auth())
  .as('editor.publications.destroy')

const GeneralSettingsController = () => import('#controllers/general-settings-controller')

router
  .get('/publications/:slug/settings', [GeneralSettingsController, 'show'])
  .use(middleware.auth())
  .as('editor.settings.general')

const StripeWebhooksController = () => import('#controllers/stripe_webhooks_controller')
router.post('/webhooks/stripe', [StripeWebhooksController, 'handle']).as('stripe.webhooks')

const SubscribersController = () => import('#controllers/subscribers_controller')
router
  .get('/publications/:slug/audience', [SubscribersController, 'index'])
  .use(middleware.auth())
  .as('editor.subscribers.index')

router
  .post('/publications/:slug/contacts/sync', [SubscribersController, 'sync'])
  .use(middleware.auth())
  .as('editor.subscribers.sync')

router
  .delete('/publications/:slug/contacts/:id', [SubscribersController, 'destroy'])
  .use(middleware.auth())
  .as('editor.subscribers.destroy')

const PostsController = () => import('#controllers/editor/posts-controller')

router
  .get('/publications/:slug/posts', [PostsController, 'index'])
  .use(middleware.auth())
  .as('editor.posts.index')

router
  .post('/publications/:slug/posts', [PostsController, 'store'])
  .use(middleware.auth())
  .as('editor.posts.store')

router
  .get('/publications/:slug/posts/:postId/edit', [PostsController, 'edit'])
  .use(middleware.auth())
  .as('editor.posts.edit')

router
  .patch('/publications/:slug/posts/:postId', [PostsController, 'update'])
  .use(middleware.auth())
  .as('editor.posts.update')

router
  .delete('/publications/:slug/posts/:postId', [PostsController, 'destroy'])
  .use(middleware.auth())
  .as('editor.posts.destroy')

router
  .post('/publications/:slug/posts/:postId/publish', [PostsController, 'publish'])
  .use(middleware.auth())
  .as('editor.posts.publish')

router
  .post('/publications/:slug/posts/:postId/unpublish', [PostsController, 'unpublish'])
  .use(middleware.auth())
  .as('editor.posts.unpublish')
