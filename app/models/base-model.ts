import { beforeCreate, column, BaseModel as LucidBaseModel } from '@adonisjs/lucid/orm'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'

export default class BaseModel extends LucidBaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignId(model: BaseModel) {
    model.id = cuid()
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
