import type { HttpContext } from '@adonisjs/core/http'

export default class ResetPasswordController {
  show({ inertia }: HttpContext) {
    return inertia.render('auth/reset-password')
  }

  async handle({}: HttpContext) {}
}
