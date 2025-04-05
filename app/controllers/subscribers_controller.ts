import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { Resend } from 'resend'
import logger from '@adonisjs/core/services/logger'

export default class SubcribersController {
  async index({ auth, params, response, inertia }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .first()

    if (!publication) {
      return response.notFound()
    }

    const contacts = await publication.related('contacts').query().orderBy('created_at', 'desc')

    return inertia.render('editor/audience', { contacts })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .first()

    if (!publication) {
      return response.notFound()
    }

    const contact = await publication.related('contacts').query().where('id', params.id).first()

    if (!contact) {
      return response.notFound()
    }

    const resend = new Resend(env.get('RESEND_API_KEY'))

    try {
      // Delete from Resend if we have a resendId
      if (contact.resendId) {
        await resend.contacts.remove({
          audienceId: publication.resendAudienceId!,
          id: contact.resendId,
        })
      }

      // Delete from our database
      await contact.delete()

      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to delete contact', {
        error,
        contactId: contact.id,
        publicationId: publication.id,
      })

      return response.internalServerError({
        error: 'Failed to delete contact',
      })
    }
  }

  async sync({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .first()

    if (!publication) {
      return response.notFound()
    }

    const resend = new Resend(env.get('RESEND_API_KEY'))

    try {
      // Get all contacts from Resend
      const { data } = await resend.contacts.list({
        audienceId: publication.resendAudienceId!,
      })

      if (!data?.data) {
        return response.internalServerError({
          error: 'Failed to fetch contacts from Resend',
        })
      }

      // Update or create contacts in our database
      for (const resendContact of data.data) {
        await publication.related('contacts').updateOrCreate(
          {
            email: resendContact.email,
          },
          {
            resendId: resendContact.id,
            unsubscribed: resendContact.unsubscribed,
          }
        )
      }

      return response.redirect().back()
    } catch (error) {
      logger.error('Failed to sync contacts', {
        error,
        publicationId: publication.id,
      })

      return response.internalServerError({
        error: 'Failed to sync contacts',
      })
    }
  }
}
