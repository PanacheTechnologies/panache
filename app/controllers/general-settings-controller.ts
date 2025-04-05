import type { HttpContext } from '@adonisjs/core/http'

export default class GeneralSettingsController {
  async show({ inertia, auth, params }: HttpContext) {
    const publication = await auth
      .user!.related('publications')
      .query()
      .where('slug', params.slug)
      .firstOrFail()

    return inertia.render('editor/settings/general', {
      publication,
    })
  }
}
