import { column } from '@adonisjs/lucid/orm'
import BaseModel from './base-model.js'
import { Utterance } from 'gladia'

export default class Transcription extends BaseModel {
  @column()
  declare youtubeVideoId: string

  @column({
    prepare(value) {
      return JSON.stringify(value)
    },
    consume(value) {
      return JSON.parse(value)
    },
  })
  declare utterances: Utterance[]
}
