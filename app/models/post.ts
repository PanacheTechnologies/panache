import { DateTime } from 'luxon'
import { afterSave, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Publication from './publication.js'
import BaseModel from './base-model.js'
import User from './user.js'
import { MarkdownFile } from '@dimerapp/markdown'
import { codeblocks, Shiki } from '@dimerapp/shiki'
import { toHtml } from '@dimerapp/markdown/utils'

export default class Post extends BaseModel {
  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare content: string

  @column()
  declare imageUrl: string | null

  @column()
  declare published: boolean

  @column()
  declare summary: string

  @column()
  declare html: string

  @belongsTo(() => User, {
    foreignKey: 'authorId',
  })
  declare author: BelongsTo<typeof User>

  @column()
  declare authorId: string | null

  @column.dateTime()
  declare publishedAt: DateTime | null

  @computed()
  get date() {
    return this.publishedAt?.toFormat('yyyy-MM-dd')
  }

  @belongsTo(() => Publication)
  declare publication: BelongsTo<typeof Publication>

  @column()
  declare publicationId: string

  @afterSave()
  static async computeHtml(post: Post) {
    const md = new MarkdownFile(post.content)
    const shiki = new Shiki()

    shiki.useTheme('github-dark')

    await shiki.boot()

    md.transform(codeblocks, shiki)
    await md.process()
    const { contents: html, excerpt } = toHtml(md)

    post.html = html
    post.summary = excerpt || ''
    await post.save()
  }
}
