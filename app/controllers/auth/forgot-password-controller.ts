import type { HttpContext } from '@adonisjs/core/http'

export default class ForgotPasswordController {
  show({ inertia }: HttpContext) {
    return inertia.render('auth/forgot-password')
  }

  async handle({}: HttpContext) {}
}
