import { belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import AppBaseModel from './base-model.js'
import Post from './post.js'
import Contact from './contact.js'
import router from '@adonisjs/core/services/router'

export default class Publication extends AppBaseModel {
  @column()
  declare userId: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare resendAudienceId: string | null

  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>

  @hasMany(() => Contact)
  declare contacts: HasMany<typeof Contact>

  @computed()
  get url() {
    return router.makeUrl('listPosts', { slug: this.slug })
  }
}
