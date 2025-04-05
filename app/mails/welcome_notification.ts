import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'
import env from '#start/env'

export default class WelcomeNotification extends BaseMail {
  from = 'Alexis from Panache <alexis@updates.panache.so>'
  subject = 'Welcome to Panache!'
  replyTo = env.get('MARKETING_REPLY_TO')

  constructor(private user: User) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.user.email)

    this.message.html(`<p>Hey,</p>
<p>My name is Alexis — I'm the founder of Panache.</p>
<p>We started Panache because we wanted a better newsletter platform for creators.</p>
<p>A simple, fast, and elegant interface that just works.</p>
<p><strong>P.S: Why did you sign up? What brought you here?</strong></p>
<p>Hit "Reply" and let me know. I read and reply to every email.</p>
<p>Cheers,<br />
Alexis</p>`)
  }
}
