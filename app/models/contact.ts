import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Publication from './publication.js'
import BaseModel from './base-model.js'

export default class Contact extends BaseModel {
  @column()
  declare email: string

  @column()
  declare unsubscribed: boolean

  @column()
  declare resendId: string | null

  @column()
  declare publicationId: string

  @belongsTo(() => Publication)
  declare publication: BelongsTo<typeof Publication>
}
