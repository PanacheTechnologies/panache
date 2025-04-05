import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class SignInController {
  show({ inertia }: HttpContext) {
    return inertia.render('auth/sign-in')
  }

  async handle({ auth, request, response }: HttpContext) {
    const signInValidator = vine.compile(
      vine.object({
        email: vine.string().email().toLowerCase().trim(),
        password: vine.string().minLength(8),
      })
    )

    const { email, password } = await request.validateUsing(signInValidator)
    const nextPath = request.input('next')
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)

    if (nextPath) {
      return response.redirect().toPath(nextPath)
    }

    return response.redirect('/publications')
  }
}
