import nano from 'nanoid'
import { Type as T, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export const ClaimsSchema = T.Composite([T.Record(T.String(), T.Any())])

export type Claims = Static<typeof ClaimsSchema>

export const UserSchema = T.Object({
  id: T.String(),
  name: T.String(),
  email: T.String({
    type: 'string',
    format: 'email'
  }),
  password: T.String(),
  claims: ClaimsSchema,
  created_at: T.String({
    format: 'date-time'
  })
})
export type User = Static<typeof UserSchema>

export const PostSchema = T.Object({
  id: T.String(),
  user_id: T.String(),
  version: T.Number(),
  title: T.String(),
  content: T.String(),
  image_url: T.String(),
  views: T.Number(),
  likes: T.Number(),
  dislikes: T.Number(),
  created_at: T.String({
    format: 'date-time'
  }),
  updated_at: T.String({
    format: 'date-time'
  })
})
export type Post = Static<typeof PostSchema>

export function generatePublicId() {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  const length = 12

  return nano.customAlphabet(alphabet, length)()
}
