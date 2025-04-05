import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class AuthGithubController {
  async redirect({ ally, params }: HttpContext) {
    return ally.use(params.provider).redirect()
  }

  async callback({ ally, auth, response, params }: HttpContext) {
    const provider = ally.use(params.provider)

    if (provider.accessDenied()) {
      return 'You have cancelled the login process'
    }

    if (provider.stateMisMatch()) {
      return 'We are unable to verify the request. Please try again'
    }

    if (provider.hasError()) {
      return provider.getError()
    }

    try {
      const providerUser = await provider.user()

      let user = await User.findBy('email', providerUser.email)

      if (!user) {
        user = await User.create({
          email: providerUser.email,
          fullName: providerUser.name,
        })
      }

      await auth.use('web').login(user)

      return response.redirect('/publications')
    } catch (error) {
      logger.error(error)
      return response.internalServerError('Something went wrong')
    }
  }
}
