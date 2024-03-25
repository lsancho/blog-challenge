import { Type as T, type Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { ClaimsSchema } from '~/entities'

export type Fastify = import('~/index').Fastify
export type Config = typeof import('~/config')

export const ClaimsSchemaCompiled = TypeCompiler.Compile(ClaimsSchema)
export type Claims = Static<typeof ClaimsSchema>

export const HeadersSchema = T.Object({
  authorization: T.String({ pattern: '^Bearer .+' })
})

export type Headers = Static<typeof HeadersSchema>

export type IAuthService = {
  sign: (claims: Claims, expireInMs: number) => Promise<string>
  verify: (token: string) => Promise<Claims>
}

export class ApiError extends Error {
  message: string
  constructor(message: string) {
    super(message)
    this.message = message
  }
}

export class AuthError extends ApiError {
  constructor(message: 'unauthorized' | 'forbidden') {
    super(message)
  }
}

export function hasConfig(f: Fastify): f is Fastify & { config: Config } {
  return Object.keys(f).includes('config')
}

export function hasUser(f: Fastify): f is Fastify & { config: Config } {
  return Object.keys(f).includes('config')
}
