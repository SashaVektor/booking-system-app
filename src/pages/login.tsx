/* eslint-disable @next/next/no-img-element */
import { type ChangeEvent, type FC, useState } from 'react'
import { HiLockClosed } from "react-icons/hi"
import { trpc } from "../utils/trpc"
import { useRouter } from "next/router"
import Head from "next/head"



const Login: FC = () => {
    const [input, setInput] = useState<{ email: string, password: string }>({ email: "", password: "" })
    const router = useRouter()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target;
        setInput((prev) => ({ ...prev, [name]: value }))
    }

    const { mutate: login, isError } = trpc.admin.login.useMutation({
        onSuccess: () => {
            void router.push("/dashboard")
        },

    })

    return <>
        <Head>
            <title>Login</title>
            <meta name='description' content='by alex' />
            <link rel='icon' href='/logo.avif' />
        </Head>
        <div className='flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-login'>
            <div className='w-full max-w-md space-y-8'>
                <div>
                    <img
                        className='mx-auto h-12 w-auto'
                        src='https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg'
                        alt='Workflow'
                    />
                    <h2 className='mt-6 text-center text-3xl font-bold text-amber-500'>Sign in to your account</h2>
                    <p className='mt-2 text-center text-sm text-amber-500'>
                        Or{' '}
                        <a href='#' className='font-medium text-indigo-600 hover:text-indigo-500'>
                            start your 14-day free trial
                        </a>
                    </p>
                </div>
                <form className='mt-8 space-y-6'>
                    <input type='hidden' name='remember' defaultValue='true' />
                    <div className='-space-y-px rounded-md shadow-sm'>
                        <p className='pb-1 text-sm text-red-600'>{isError && 'Invalid login credentials'}</p>
                        <div>
                            <label htmlFor='email-address' className='sr-only'>
                                Email address
                            </label>
                            <input
                                id='email-address'
                                name='email'
                                type='email'
                                value={input.email}
                                onChange={handleChange}
                                autoComplete='email'
                                required
                                className='relative block w-full bg-amber-300 text-white mb-4 appearance-none rounded-none rounded-t-md border border-amber-300 px-3 py-2 placeholder-white focus:z-10 focus:border-amber-300 focus:outline-none focus:bg-amber-300 sm:text-sm'
                                placeholder='Email address'
                            />
                        </div>
                        <div>
                            <label htmlFor='password' className='sr-only'>
                                Password
                            </label>
                            <input
                                id='password'
                                name='password'
                                type='password'
                                value={input.password}
                                onChange={handleChange}
                                autoComplete='current-password'
                                required
                                className='relative block w-full bg-amber-300 text-white appearance-none rounded-none rounded-b-md border border-amber-300 px-3 py-2  placeholder-white focus:z-10 focus:border-amber-300 focus:outline-none focus:bg-amber-300 sm:text-sm'
                                placeholder='Password'
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                            <input
                                id='remember-me'
                                name='remember-me'
                                type='checkbox'
                                className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                            />
                            <label htmlFor='remember-me' className='ml-2 block text-sm text-white'>
                                Remember me
                            </label>
                        </div>

                        <div className='text-sm'>
                            <a href='#' className='font-medium text-indigo-600 hover:text-indigo-500'>
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            onClick={(e) => {
                                e.preventDefault()
                                login(input)
                            }}
                            className='group relative flex w-full justify-center rounded-md border border-transparent bg-amber-500 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'>
                            <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
                                <HiLockClosed
                                    className='h-5 w-5 text-indigo-500 group-hover:text-indigo-400'
                                    aria-hidden='true'
                                />
                            </span>
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}

export default Login