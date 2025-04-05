import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export default class PostsController {
  async index({ auth, params, inertia }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const posts = await publication.related('posts').query().orderBy('created_at', 'desc')

    const publishedPosts = posts.filter((post) => post.published)
    const draftPosts = posts.filter((post) => !post.published)

    return inertia.render('editor/posts/index', {
      publication,
      publishedPosts,
      draftPosts,
    })
  }

  async store({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const post = await publication.related('posts').create({
      title: '',
      content: '',
      authorId: auth.user!.id,
    })

    return response.redirect().toRoute('editor.posts.edit', {
      slug: params.slug,
      postId: post.id,
    })
  }

  async edit({ auth, params, inertia }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const post = await publication.related('posts').query().where('id', params.postId).firstOrFail()

    return inertia.render('editor/posts/edit', {
      publication,
      post,
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()
    const post = await publication.related('posts').query().where('id', params.postId).firstOrFail()

    const validator = vine.compile(
      vine.object({
        title: vine.string().trim().minLength(2).maxLength(100),
        content: vine.string().trim().minLength(10),
        published: vine.boolean().optional(),
      })
    )

    const data = (await request.validateUsing(validator)) as {
      title: string
      content: string
      published?: boolean
      publishedAt?: DateTime
    }

    // Handle publishedAt when published status changes
    if (data.published !== undefined && data.published !== post.published) {
      if (data.published && !post.publishedAt) {
        data.publishedAt = DateTime.now()
      }
    }

    await post.merge(data).save()

    return response.redirect().back()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const post = await publication.related('posts').query().where('id', params.postId).firstOrFail()

    await post.delete()

    return response.redirect().back()
  }

  async publish({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const post = await publication.related('posts').query().where('id', params.postId).firstOrFail()

    if (!post.published) {
      await post
        .merge({
          published: true,
          publishedAt: post.publishedAt || DateTime.now(),
        })
        .save()
    }

    return response.redirect().back()
  }

  async unpublish({ auth, params, response }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    const post = await publication.related('posts').query().where('id', params.postId).firstOrFail()

    await post
      .merge({
        published: false,
      })
      .save()

    return response.redirect().back()
  }
}
