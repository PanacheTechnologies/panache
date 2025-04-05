import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import env from '#start/env'
import Stripe from 'stripe'

@inject()
export default class StripeWebhooksController {
  async handle({ request, response }: HttpContext) {
    const stripe = new Stripe(env.get('STRIPE_SECRET_KEY'))
    const signature = request.header('stripe-signature')

    /**
     * Ensure that Stripe webhooks are enabled.
     */
    if (!stripe.webhooks) {
      return response.badRequest('Webhooks are not configured')
    }

    /**
     * Check whether this request looks like a Stripe webhook request.
     */
    if (!request.raw() || !signature) {
      return response.badRequest('Invalid request')
    }

    try {
      const event = stripe.webhooks.constructEvent(
        request.raw()!,
        signature,
        env.get('STRIPE_WEBHOOK_SECRET')
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        if (!session.metadata?.publicationId) {
          throw new Error('No publication ID found in session metadata')
        }
      }

      return response.status(200).send({ received: true })
    } catch (err) {
      console.error('Webhook error:', err.message)
      return response.status(400).send(`Webhook Error: ${err.message}`)
    }
  }
}
