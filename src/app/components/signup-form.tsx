'use client'

import { useActionState } from 'react'
import { signup, type AuthState } from '@/app/actions/auth'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

const initialState: AuthState = {}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState)

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
        placeholder="Min 6 characters"
        minLength={6}
        required
      />
      <Input
        name="brandName"
        type="text"
        label="Brand Name"
        placeholder="Your brand name"
        required
      />
      <Input
        name="inviteCode"
        type="text"
        label="Invite Code"
        placeholder="Enter your invite code"
        className="uppercase"
        required
      />

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" loading={pending}>
        Create Account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-gold hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
