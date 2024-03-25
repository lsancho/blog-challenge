import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import auth from './auth.route'
import post from './post.route'

export default (): FastifyPluginAsyncTypebox => async (fastify) => {
  fastify.register(auth())
  fastify.register(post())
}
