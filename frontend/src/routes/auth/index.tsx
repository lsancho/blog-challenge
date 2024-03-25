import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, Input, Link, Tab, Tabs } from '@nextui-org/react'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import * as yup from 'yup'
import { useAuth } from '~/lib/auth'
import { useSignIn, useSignUp } from './hooks'

export default function AuthPage() {
  const { data } = useAuth()
  const [selected, setSelected] = React.useState<string | number>('sign-in')

  if (data) {
    return <Navigate to='/' />
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='flex flex-col'>
        <Card className='h-[400px] w-[340px] max-w-full'>
          <CardBody className='overflow-hidden'>
            <Tabs fullWidth size='md' aria-label='Tabs form' selectedKey={selected} onSelectionChange={setSelected}>
              <Tab key='sign-in' title='Sign in'>
                <SingIn goToSignup={() => setSelected('sign-up')} />
              </Tab>
              <Tab key='sign-up' title='Sign up'>
                <SignUp gotToSignIn={() => setSelected('sign-in')} />
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </main>
  )
}

type SingInProps = {
  goToSignup: () => void
}
function SingIn(props: SingInProps) {
  const [isDisabled, setIsDisabled] = useState(true)
  const submitButton = useRef<HTMLInputElement>(null)
  const schema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required()
  })
  type FormData = yup.InferType<typeof schema>

  const { register, handleSubmit, formState, setError } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const { trigger: signin, loading, error, authenticated } = useSignIn()

  const onSubmit = async (data: FormData) => {
    await signin({ email: data.email, password: data.password })
  }

  useEffect(() => {
    if (error) {
      setError('root.server', { message: 'error' })
    }
  }, [setError, error])

  useEffect(() => {
    if (loading) setIsDisabled(true)
    else {
      setTimeout(() => {
        setIsDisabled(false)
      }, 3000)
    }
  }, [loading])

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
      <Input
        isRequired
        label='Email'
        autoComplete='off'
        {...register('email')}
        isInvalid={!!formState.errors.email}
        errorMessage={formState.errors.email?.message}
      />
      <Input
        isRequired
        label='Password'
        autoComplete='off'
        type='password'
        {...register('password')}
        isInvalid={!!formState.errors.password}
        errorMessage={formState.errors.password?.message}
      />
      <p className='cursor-pointer text-center text-small'>
        Need to create an account?{' '}
        <Link size='sm' onPress={() => props.goToSignup()}>
          Sign up
        </Link>
      </p>
      {formState.errors.root?.server && <p className='cursor-pointer text-center text-small text-red-500'>Acesso negado</p>}
      <div className='flex justify-end gap-2'>
        <Button
          fullWidth
          color='primary'
          type='submit'
          isDisabled={isDisabled}
          isLoading={loading}
          onPress={(e) => {
            console.log('click')
            submitButton.current?.click()
          }}
        >
          Sign in
        </Button>
        <input type='submit' ref={submitButton} className='hidden' />
      </div>
    </form>
  )
}

type SignUpProps = {
  gotToSignIn: () => void
}
function SignUp(props: SignUpProps) {
  const [isDisabled, setIsDisabled] = useState(true)
  const submitButton = useRef<HTMLInputElement>(null)
  const schema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required()
  })
  type FormData = yup.InferType<typeof schema>

  const { register, handleSubmit, formState, setError } = useForm<FormData>({
    resolver: yupResolver(schema)
  })

  const { trigger: singup, loading, error, authenticated } = useSignUp()

  const onSubmit = async (data: FormData) => {
    console.log('onsubmit', data)
    await singup({ name: data.name, email: data.email, password: data.password })
  }

  useEffect(() => {
    console.log('error', error)
    if (error) {
      setError('root.server', { message: 'error' })
    }
  }, [setError, error])

  useEffect(() => {
    if (loading) setIsDisabled(true)
    else {
      setTimeout(() => {
        setIsDisabled(false)
      }, 3000)
    }
  }, [loading])

  return (
    <form
      className='flex h-[300px] flex-col gap-4'
      onSubmit={handleSubmit(onSubmit, (e) => {
        console.log(e)
      })}
    >
      <Input
        isRequired
        label='Name'
        autoComplete='off'
        {...register('name')}
        isInvalid={!!formState.errors.name}
        errorMessage={formState.errors.name?.message}
      />
      <Input
        isRequired
        label='Email'
        autoComplete='off'
        {...register('email')}
        isInvalid={!!formState.errors.email}
        errorMessage={formState.errors.email?.message}
      />
      <Input
        isRequired
        label='Password'
        autoComplete='off'
        type='password'
        {...register('password')}
        isInvalid={!!formState.errors.password}
        errorMessage={formState.errors.password?.message}
      />
      <p className='cursor-pointer text-center text-small'>
        Already have an account?{' '}
        <Link size='sm' onPress={() => props.gotToSignIn()}>
          Sign in
        </Link>
      </p>
      {formState.errors.root?.server && <p className='text-xs text-red-500'>{formState.errors.root?.server.message}</p>}
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
          Sign up
        </Button>
        <input type='submit' ref={submitButton} className='hidden' />
      </div>
    </form>
  )
}
