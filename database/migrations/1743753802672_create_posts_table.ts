import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('publication_id').references('id').inTable('publications').onDelete('CASCADE')
      table.string('author_id').references('id').inTable('users').nullable()
      table.string('title').notNullable().defaultTo('')
      table.string('slug').nullable()
      table.text('content').notNullable().defaultTo('')
      table.text('summary').notNullable().defaultTo('')
      table.text('html').notNullable().defaultTo('')
      table.string('image_url').nullable()
      table.boolean('published').defaultTo(false)
      table.timestamp('published_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['publication_id', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
