import { column } from '@adonisjs/lucid/orm'
import BaseModel from './base-model.js'

export default class KeyMoment extends BaseModel {
  @column()
  declare youtubeVideoId: string

  @column()
  declare start: number

  @column()
  declare end: number

  @column()
  declare description: string

  @column()
  declare videoPath: string
}
