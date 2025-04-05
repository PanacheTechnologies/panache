import { Request } from '@adonisjs/core/http'

Request.macro('wantsJSON', function (this: Request) {
  return this.headers().accept === 'application/json'
})

declare module '@adonisjs/core/http' {
  interface Request {
    wantsJSON(): boolean
  }
}
