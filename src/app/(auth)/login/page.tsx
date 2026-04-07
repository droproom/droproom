import { LoginForm } from '@/app/components/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-dvh px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Link href="/" className="block text-center mb-10">
          <h1 className="text-2xl font-bold tracking-[0.3em] uppercase">
            Droproom
          </h1>
          <div className="w-10 h-px bg-gold mx-auto mt-2" />
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
