
'use client'

import { useState, useTransition } from 'react'
import { login } from "@/actions/login"

export default function LoginPage() {

    const [error, setError] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError("")

        // Extraction form data natively
        const formData = new FormData(event.currentTarget)
        const cpf = formData.get('cpf') as string
        const password = formData.get('password') as string 

        // startTransition keeps the UI responsive while the server action resolves
        startTransition(() => {
            login({ cpf, password })
                .then((data) => {
                    if (data?.error) {
                        setError(data.error)
                    }
                })
                .catch(() => setError('Algo deu errado. Por favor tente novamente'))
        })
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
            <div className= 'w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md'>
                <div className='text-center'>
                    <h2 className='text-3xl font-extrabold text-gray-900'> 
                        ApexBank
                    </h2>
                    <p className='mt-2 text-sm text-gray-600' >
                        Dashboard da Companhia de sistema financeiro aberto
                    </p>
                </div>

                <form onSubmit={onSubmit} className='mt-8 space-y-6'>
                    <div className='space-y-4'>
                        <div>
                            <label htmlFor="cpf" className='block text-sm font-medium text-gray-700'>
                                CPF
                            </label>
                            <input id='cpf' name='cpf' type="text" disabled={isPending} required  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:opacity-50 sm:text-sm'
                            placeholder="000.000.000-00" maxLength={11}/>
                        </div>

                        <div>
                            <label htmlFor="password" className='block text-sm font-medium text-gray-700'>
                                Password
                            </label>
                            <input id='password' name='password' type="password" disabled={isPending} required className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:opacity-50 sm:text-sm' placeholder='*********' maxLength={14}/>
                        </div>
                    </div>

                    {/* Error message display*/}
                    {error && (
                        <div className='rounded-md bg-red-50 p-3 text-sm text-red-500'>
                            {error}
                        </div>
                    )}

                    <button type='submit' disabled={isPending} className='flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50' >
                        {isPending ? 'Authentication...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}