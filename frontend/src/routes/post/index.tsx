import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, Input, Textarea } from '@nextui-org/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useEditPost } from './hooks'
import { useAuth } from '~/lib/auth'

function Page() {
  const { data: auth } = useAuth()
  const [isDisabled, setIsDisabled] = useState(true)
  const [lastPost, setLastPost] = useState({
    id: '',
    title: '',
    version: 0
  })
  const submitButton = useRef<HTMLInputElement>(null)
  const schema = yup.object({
    title: yup.string().required(),
    content: yup.string().required(),
    image_url: yup.string().url().required()
  })
  type FormData = yup.InferType<typeof schema>

  const { trigger: editPost, loading, error } = useEditPost()

  const { register, handleSubmit, formState, setError, reset } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    const { version, id } = await editPost({
      id: '',
      title: data.title,
      content: data.content,
      image_url: data.image_url,
      user_id: auth!.claims.sub
    })
    setLastPost({ id, title: data.title, version })
    reset()
  }

  useEffect(() => {
    if (loading) setIsDisabled(true)
    else {
      setTimeout(() => {
        setIsDisabled(false)
      }, 3000)
    }
  }, [loading])

  useEffect(() => {
    if (error) {
      setError('root.server', { message: 'error' })
    }
  }, [setError, error])

  useEffect(() => {
    console.log('formState', formState)
  }, [formState])

  return (
    <section>
      <Card className='h-full w-[680px] max-w-full'>
        <CardBody className='overflow-hidden'>
          <form
            className='flex flex-col gap-4'
            onSubmit={handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
          >
            <Input
              isRequired
              label='Title'
              autoComplete='off'
              {...register('title')}
              isInvalid={!!formState.errors.title}
              errorMessage={formState.errors.title?.message}
            />
            <Textarea
              isRequired
              minRows={5}
              label='Content'
              autoComplete='off'
              {...register('content')}
              isInvalid={!!formState.errors.content}
              errorMessage={formState.errors.content?.message}
            />
            <Input
              isRequired
              label='Image URL'
              autoComplete='off'
              {...register('image_url')}
              isInvalid={!!formState.errors.image_url}
              errorMessage={formState.errors.image_url?.message}
            />
            {formState.errors.root?.server && <p className='text-xs text-red-500'>{formState.errors.root?.server.message}</p>}
            {lastPost.id && (
              <div>
                <p className='text-green-500'>
                  Post <span className='font-bold'>'{lastPost.title}'</span> updated successfully
                </p>
              </div>
            )}
            <div className='flex justify-end gap-2'>
              <Button
                fullWidth
                color='primary'
                type='submit'
                isLoading={loading}
                isDisabled={isDisabled}
                onPress={(e) => {
                  console.log('click')
                  submitButton.current?.click()
                }}
              >
                Post
              </Button>
              <input type='submit' ref={submitButton} className='hidden' />
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  )
}

// https://images.unsplash.com/photo-1710942499889-71f233dae342?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D

export default Page
