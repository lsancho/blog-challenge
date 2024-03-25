import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type as T, type Static } from '@sinclair/typebox'
import { FastifyReply, HookHandlerDoneFunction } from 'fastify'
import { Post, PostSchema, User, generatePublicId } from '~/entities'

const EditPostReqSchema = T.Object({
  id: T.Optional(T.String()),
  user_id: T.String(),
  title: T.String(),
  content: T.String(),
  image_url: T.String()
})
type EditPostRequest = Static<typeof EditPostReqSchema>

const EditPostResSchema = T.Object({
  id: T.Optional(T.String()),
  version: T.Number()
})
type EditPostResponse = Static<typeof EditPostResSchema>

const GetPostReqSchema = T.Object({
  id: T.String()
})
type GetPostRequest = Static<typeof GetPostReqSchema>

const GetPostResSchema = PostSchema
type GetPostResponse = Post

const GetPostsResSchema = T.Array(PostSchema)
type GetPostsResponse = Static<typeof GetPostsResSchema>

export default (): FastifyPluginAsyncTypebox => async (fastify) => {
  fastify.post<{
    Body: EditPostRequest
    Reply: EditPostResponse
  }>(
    '/post',
    {
      schema: {
        body: EditPostReqSchema,
        response: {
          '2xx': EditPostResSchema
        }
      },
      preHandler: fastify.verifyPasetoToken
    },
    async (req, res) => {
      const client = await fastify.pg.connect()
      try {
        /*select * from blog.upsert_post(jsonb_build_object(
        'id', 'xxx',
        'user_id', '9phkptw9yzsk',
        'title', 'titulo',
        'content', 'conteudo',
        'image_url', 'image_url')
        );*/

        req.body.id = req.body.id || generatePublicId()

        const { rows } = await client.query<Partial<Post>>('SELECT public_id as id, version FROM blog.upsert_post($1)', [
          req.body
        ])
        const data = rows[0]

        return res.status(201).send({ id: data.id!, version: data.version! })
      } finally {
        client.release()
      }
    }
  )

  fastify.get<{
    Params: GetPostRequest
    Reply: GetPostResponse
  }>(
    '/post/:id',
    {
      schema: {
        params: GetPostReqSchema,
        response: {
          '2xx': GetPostResSchema
        }
      },
      preHandler: fastify.verifyPasetoToken
    },
    async (req, res) => {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query<Post>(
          `
        select  p.public_id as id,
                u.public_id as user_id,
                title,
                content,
                image_url,
                p.version,
                views,
                likes,
                dislikes,
                p.created_at,
                p.updated_at
        from blog.post p
                join blog."user" u on p.user_id = u.id
                join blog.post_version v
                      on p.id = v.post_id
                          and v.version = p.version
        where p.public_id = $1
        limit 1;
        `,
          [req.params.id]
        )
        const data = rows[0]

        return res.status(201).send(data)
      } finally {
        client.release()
      }
    }
  )

  fastify.get<{
    Reply: GetPostsResponse
  }>(
    '/post',
    {
      schema: {
        response: {
          '2xx': GetPostsResSchema
        }
      },
      preHandler: fastify.verifyPasetoToken
    },
    async (req, res) => {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query<Post>(
          `
          select  p.public_id as id,
                  u.public_id as user_id,
                  title,
                  content,
                  image_url,
                  p.version,
                  views,
                  likes,
                  dislikes,
                  p.created_at,
                  p.updated_at
          from blog.post p
                    join blog."user" u on p.user_id = u.id
                    join blog.post_version v
                        on p.id = v.post_id
                            and v.version = p.version
          order by p.created_at;
        `
        )

        console.log(rows)
        return res.status(201).send(rows)
      } finally {
        client.release()
      }
    }
  )
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyPasetoToken: (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void
  }

  interface FastifyRequest {
    user?: User
  }
}
