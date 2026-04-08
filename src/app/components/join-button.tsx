'use client'

import Link from 'next/link'

export function JoinButton() {
  return (
    <Link
      href="/signup"
      className="relative w-[200px] sm:w-[280px] h-[70px] sm:h-[90px] no-underline group cursor-pointer inline-block rounded-full p-px"
    >
      {/* Outer glow ring — auto-radiates on mobile, hover on desktop */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c9a96e]/0 via-[#c9a96e]/40 to-[#c9a96e]/0 animate-glow-radiate md:animate-none md:opacity-0 md:group-hover:opacity-100 blur-md transition-opacity duration-700" />

      {/* Radial glow — auto on mobile, hover on desktop */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(201,169,78,0.5)_0%,rgba(201,169,78,0)_75%)] animate-glow-radiate md:animate-none md:opacity-0 transition-opacity duration-500 md:group-hover:opacity-100" />
      </span>

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full ring-1 ring-[#c9a96e]/30 md:ring-[#c9a96e]/20 md:group-hover:ring-[#c9a96e]/40 transition-all duration-500" />
      <span className="absolute inset-[-4px] rounded-full animate-pulse-ring" />

      {/* Inner content */}
      <div className="relative flex justify-center w-full h-full items-center z-10 rounded-full bg-[#0a0a0a] ring-1 ring-[#c9a96e]/20 md:ring-white/10 md:group-hover:ring-[#c9a96e]/30 transition-all duration-500">
        <span className="text-xl sm:text-3xl uppercase tracking-[0.25em] font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-300 via-[#e6d296] to-neutral-300 md:from-neutral-400 md:via-[#c9a96e] md:to-neutral-400 md:group-hover:from-neutral-200 md:group-hover:via-[#e6d296] md:group-hover:to-neutral-200 transition-all duration-500">
          Join
        </span>
      </div>
    </Link>
  )
}
