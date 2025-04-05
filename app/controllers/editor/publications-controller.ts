import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import vine from '@vinejs/vine'
import { Resend } from 'resend'
import db from '@adonisjs/lucid/services/db'

export default class PublicationsController {
  async index({ auth, response }: HttpContext) {
    const publication = await auth.user!.related('publications').query().first()

    if (publication) {
      return response.redirect().toRoute('editor.publications.show', {
        slug: publication.slug,
      })
    }

    return response.redirect('/onboarding')
  }

  create({ inertia }: HttpContext) {
    return inertia.render('editor/publications/create')
  }

  async show({ auth, params, response, inertia }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .first()

    if (!publication) {
      return response.notFound('Publication not found')
    }

    /**
     * Compute the number of posts.
     */
    const { count: postsCount } = await db
      .from('posts')
      .where('publication_id', publication.id)
      .count('* as count')
      .first()

    /**
     * Compute the number of contact in the audience
     */
    const { count: contactsCount } = await db
      .from('contacts')
      .where('publication_id', publication.id)
      .count('* as count')
      .first()

    return inertia.render('editor/show', {
      publication,
      numberOfPosts: Number.parseInt(postsCount),
      numberOfContacts: Number.parseInt(contactsCount),
    })
  }

  async store({ request, response, auth }: HttpContext) {
    // Define validation schema
    const validator = vine.compile(
      vine.object({
        title: vine.string().trim().minLength(2).maxLength(100),
        slug: vine
          .string()
          .trim()
          .minLength(2)
          .maxLength(50)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .notIn([
            'www',
            'api',
            'app',
            'assets',
            'fonts',
            'images',
            'static',
            'storage',
            'tmp',
            'uploads',
            'favicon',
            'robots',
            'sitemap',
            'rss',
            'atom',
            'json',
            'css',
            'js',
            'png',
            'jpg',
            'jpeg',
            'gif',
            'svg',
          ])
          .unique(async (db, value) => {
            const publication = await db.from('publications').where('slug', value).first()
            return publication === null
          }),
      })
    )

    // Validate request body
    const payload = await request.validateUsing(validator)

    // Create publication
    const publication = await auth.user!.related('publications').create({
      title: payload.title,
      slug: payload.slug,
    })

    /**
     * Assign Resend audience
     */
    try {
      const resend = new Resend(env.get('RESEND_API_KEY'))
      const res = await resend.audiences.create({
        name: publication.title,
      })
      publication.resendAudienceId = res.data?.id ?? null
      await publication.save()

      // Sync contacts if audience was created
      if (publication.resendAudienceId) {
        const { data } = await resend.contacts.list({
          audienceId: publication.resendAudienceId,
        })

        if (data?.data) {
          for (const resendContact of data.data) {
            await publication.related('contacts').create({
              email: resendContact.email,
              resendId: resendContact.id,
              unsubscribed: resendContact.unsubscribed,
            })
          }
        }
      }
    } catch (error) {
      logger.error({
        message: 'Failed to create Resend audience',
        error,
        publicationId: publication.id,
      })
    }

    /**
     * Redirect to publication directly, if domain type is not custom.
     */
    return response.redirect().toRoute('editor.publications.index', {
      domain: publication.slug,
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    // Define validation schema for update
    const validator = vine.compile(
      vine.object({
        title: vine.string().trim().minLength(2).maxLength(100),
      })
    )

    // Validate request body
    const data = await request.validateUsing(validator)

    // Find the publication using domain or slug
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    // Update the publication
    await publication.merge(data).save()

    return response.redirect().back()
  }

  async destroy({ params, auth, response }: HttpContext) {
    // Find the publication and ensure it belongs to the authenticated user
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('id', params.id)
      .firstOrFail()

    try {
      // Delete the publication
      await publication.delete()

      // Redirect to onboarding if this was their only publication
      const hasOtherPublications = await auth.user!.related('publications').query().first()

      if (hasOtherPublications) {
        return response.redirect('/publications')
      } else {
        return response.redirect('/onboarding')
      }
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to delete publication',
      })
    }
  }
}
