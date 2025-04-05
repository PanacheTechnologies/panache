import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { afterCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import BaseModel from '#models/base-model'
import Publication from './publication.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import WelcomeNotification from '#mails/welcome_notification'
import mail from '@adonisjs/mail/services/main'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  /**
   * Regular columns.
   */
  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @hasMany(() => Publication)
  declare publications: HasMany<typeof Publication>

  /**
   * Hooks.
   */
  @afterCreate()
  static async sendWelcomeNotification(user: User) {
    await mail.sendLater(new WelcomeNotification(user))
  }
}
