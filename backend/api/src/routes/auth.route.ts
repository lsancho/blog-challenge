import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type as T, type Static } from '@sinclair/typebox'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import crypto from 'node:crypto'
import { errors as P, V4 } from 'paseto'
import { ClaimsSchema, User, generatePublicId } from '~/entities'
import { ApiError, AuthError, Claims, ClaimsSchemaCompiled, HeadersSchema } from './types'

const signOptions = T.Object({
  privateKey: T.String(),
  claims: ClaimsSchema,
  expireInMs: T.Number()
})

type SignOptions = Static<typeof signOptions>

export async function sign(opts: SignOptions) {
  return await V4.sign(opts.claims, opts.privateKey, {
    expiresIn: `${opts.expireInMs / 1000}s`
  })
}

const verifyOptions = T.Object({
  token: T.String(),
  publicKey: T.String()
})

type VerifyOptions = Static<typeof verifyOptions>

async function _verify(opts: VerifyOptions) {
  try {
    const result = await V4.verify<Record<string, string>>(opts.token, opts.publicKey, {
      complete: true
    })
    return result.payload
  } catch (err) {
    console.error(err)
    if (err instanceof P.PasetoError) throw new AuthError('unauthorized')
    throw err
  }
}

export async function verify(opts: VerifyOptions) {
  const claims = await _verify(opts)

  if (!ClaimsSchemaCompiled.Check(claims)) throw new AuthError('unauthorized')

  return claims
}

const SignInReqSchema = T.Object({
  email: T.String({
    type: 'string',
    format: 'email'
  }),
  password: T.String()
})
type SignInRequest = Static<typeof SignInReqSchema>

const SignUpResSchema = T.Composite([SignInReqSchema, T.Object({ name: T.String() })])
type SignUpRequest = Static<typeof SignUpResSchema>
type SignUpResponse = SignInResponse

const MessageResSchema = T.Object({
  message: T.String()
})

const MeResSchema = T.Object({
  claims: ClaimsSchema
})
type MeResponse = Static<typeof MeResSchema>

const SignInResSchema = T.Object({
  token: T.String(),
  claims: ClaimsSchema
})
type SignInResponse = Static<typeof SignInResSchema>

const getToken = (header: string) => header.slice(7)

export async function verifyPasetoToken(req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  const fastify = req.server

  req.log.trace('verifyPasetoToken', req.routerPath)

  const token = getToken(req.headers.authorization!)
  if (!token) throw new AuthError('unauthorized')

  req.log.trace('token', token)
  const claims = await verify({
    token,
    publicKey: fastify.config.get('paseto.keys.public')
  })

  if (!req.user) {
    const client = await fastify.pg.connect()
    try {
      const { rows } = await client.query<User>(
        'SELECT public_id as id, name, email, password, claims, created_at FROM blog.user WHERE public_id = $1',
        [claims.sub]
      )

      const user = rows[0]
      if (!user) throw new AuthError('unauthorized')

      // fastify.decorateRequest('user', user)
      req.user = user
      req.claims = claims
    } finally {
      client.release()
    }
  }

  if (req.user && req.user.id !== claims.sub) throw new AuthError('forbidden')
}

export default (): FastifyPluginAsyncTypebox => async (fastify) => {
  fastify.post<{
    Body: SignUpRequest
    Reply: SignUpResponse
  }>(
    '/signup',
    {
      schema: {
        body: SignUpResSchema,
        response: {
          '2xx': SignInResSchema
        }
      },
      preHandler: async (req, reply) => {
        const client = await fastify.pg.connect()
        try {
          const { rows } = await client.query<User>('SELECT public_id as id FROM blog.user WHERE email = $1', [req.body.email])
          if (rows.length > 0) throw new ApiError('email already exists')
        } finally {
          client.release()
        }
      }
    },
    async (req, res) => {
      const client = await fastify.pg.connect()
      try {
        const password = crypto.createHash('sha256').update(req.body.password).digest('hex')

        const { rows } = await client.query<User>(
          'INSERT INTO blog.user (public_id, name, email, password, claims) VALUES ($1, $2, $3, $4, $5) RETURNING public_id as id',
          [generatePublicId(), req.body.name, req.body.email, password, {}]
        )
        const userId = rows[0].id
        const config = fastify.config
        const token = await sign({
          privateKey: config.get('paseto.keys.private'),
          expireInMs: config.get('paseto.lifespan'),
          claims: {
            sub: String(userId),
            iat: new Date().getTime(),
            name: rows[0].name,
            email: rows[0].email,
            role: 'user'
          }
        })
        const payload = await verify({ token, publicKey: config.get('paseto.keys.public') })
        return res.status(201).send({ token, claims: payload })
      } finally {
        client.release()
      }
    }
  )

  fastify.post<{
    Body: SignInRequest
    Reply: SignInResponse
  }>(
    '/signin',
    {
      schema: {
        body: SignInReqSchema,
        response: {
          '2xx': SignInResSchema
        }
      },
      preHandler: async (req, reply) => {
        const client = await fastify.pg.connect()
        try {
          const { rows } = await client.query<User>(
            'SELECT public_id as id, name, email, password, claims, created_at FROM blog.user WHERE email = $1',
            [req.body.email]
          )

          const user = rows[0]
          if (!user) throw new AuthError('unauthorized')

          const password = crypto.createHash('sha256').update(req.body.password).digest('hex')
          if (password !== user.password) throw new AuthError('unauthorized')

          // fastify.decorateRequest('user', user)
          req.user = user
        } finally {
          client.release()
        }
      }
    },
    async (req, res) => {
      const config = fastify.config

      const token = await sign({
        privateKey: config.get('paseto.keys.private'),
        expireInMs: config.get('paseto.lifespan'),
        claims: {
          sub: String(req.user!.id),
          iat: new Date().getTime(),
          role: 'user',
          name: req.user!.name,
          email: req.user!.email,
          ...req.user!.claims
        }
      })
      const claims = await verify({ token, publicKey: config.get('paseto.keys.public') })

      return res.status(201).send({ token, claims })
    }
  )

  fastify.get<{
    Reply: MeResponse
  }>(
    '/auth/me',
    {
      schema: {
        headers: HeadersSchema,
        response: {
          '2xx': MeResSchema
        }
      },
      preHandler: fastify.verifyPasetoToken
    },
    async (req, res) => {
      return res.status(201).send({
        claims: req.claims || {}
      })
    }
  )
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyPasetoToken: (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void
  }

  interface FastifyRequest {
    user?: User
    claims?: Claims
  }
}
