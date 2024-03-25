import Cors from '@fastify/cors'
import Postgres from '@fastify/postgres'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Probe from 'arecibo'
import Fastify from 'fastify'
import config from './config'
import Routes from './routes'
import { verifyPasetoToken } from './routes/auth.route'

const POSTGRES_CONNECTION_STRING = `postgresql://${config.get('postgres.user')}:${config.get('postgres.password')}@${config.get('postgres.host')}:${config.get('postgres.port')}/${config.get('postgres.db')}`

const fastify = Fastify({
  logger: {
    level: 'trace',
    transport: {
      targets: [
        {
          level: 'trace',
          target: 'pino-pretty'
        }
      ]
    }
  }
})
  .withTypeProvider<TypeBoxTypeProvider>()
  .decorate('config', config)
  .decorate('verifyPasetoToken', verifyPasetoToken)
  .setErrorHandler((error, request, reply) => {
    reply.log.error(error)
    reply.status(500).send({ error })
  })
  .register(Cors, {})
  .register(Probe, {
    readinessURL: '/readyz',
    readinessCallback: (req, reply) => reply.send({ message: 'ready' }),
    livenessURL: '/livez',
    livenessCallback: (req, reply) => reply.send({ message: 'alive' }),
    logLevel: 'info'
  })
  .register(Postgres, {
    database: config.get('postgres.db'),
    user: config.get('postgres.user'),
    password: config.get('postgres.password'),
    port: config.get('postgres.port'),
    host: config.get('postgres.host')
  })
  .register(Routes())

fastify.listen({ port: config.get('port'), host: '::' }, (err, address) => {
  if (err) {
    fastify.log.fatal(err)
    process.exit(1)
  }
  fastify.log.trace(`Postgres: ${POSTGRES_CONNECTION_STRING}`)
})

export type Fastify = typeof fastify

declare module 'fastify' {
  interface FastifyInstance {
    config: typeof config
  }
}
