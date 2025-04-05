import User from '#models/user'
import { signUpValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class SignUpController {
  show({ inertia }: HttpContext) {
    return inertia.render('auth/sign-up')
  }

  async handle({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(signUpValidator)

    const user = await User.create(data)
    await user.save()

    await auth.use('web').login(user)

    return response.redirect('/publications')
  }
}
