import Link from 'next/link'
import { ConstellationBg } from '@/app/components/constellation-bg'

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center min-h-dvh overflow-hidden">
      <ConstellationBg />
      <div className="relative z-10 animate-fade-in text-center">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.3em] uppercase mb-2">
          Droproom
        </h1>
        <div className="w-16 h-px bg-gold mx-auto mb-12" />
      </div>
      <div className="relative z-10 animate-fade-in-delay">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-md border border-gold text-gold px-10 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-gold hover:text-black"
        >
          Join
        </Link>
      </div>
    </div>
  )
}
