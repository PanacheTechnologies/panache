import vine from '@vinejs/vine'

export const signUpValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(8).maxLength(255),
  })
)

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8).maxLength(255),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8).maxLength(255).confirmed({
      confirmationField: 'passwordConfirmation',
    }),
  })
)
