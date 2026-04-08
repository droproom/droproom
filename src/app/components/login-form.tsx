'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, type AuthState } from '@/app/actions/auth'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

const initialState: AuthState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect)
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
      />
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Your password"
        required
      />

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" loading={pending}>
        Log In
      </Button>

      <p className="text-center text-sm text-muted">
        Need an account?{' '}
        <Link href="/signup" className="text-gold hover:underline">
          Join
        </Link>
      </p>
    </form>
  )
}
