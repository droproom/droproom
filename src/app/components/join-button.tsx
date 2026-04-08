'use client'

import Link from 'next/link'

export function JoinButton() {
  return (
    <Link
      href="/signup"
      className="relative w-[200px] sm:w-[280px] h-[70px] sm:h-[90px] no-underline group cursor-pointer inline-block rounded-full p-px"
    >
      {/* Outer glow ring */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#c9a96e]/0 via-[#c9a96e]/40 to-[#c9a96e]/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700" />

      {/* Radial glow on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(201,169,78,0.5)_0%,rgba(201,169,78,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </span>

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full ring-1 ring-[#c9a96e]/20 group-hover:ring-[#c9a96e]/40 transition-all duration-500" />
      <span className="absolute inset-[-4px] rounded-full animate-pulse-ring" />

      {/* Inner content */}
      <div className="relative flex justify-center w-full h-full items-center z-10 rounded-full bg-[#0a0a0a] ring-1 ring-white/10 group-hover:ring-[#c9a96e]/30 transition-all duration-500">
        <span className="text-xl sm:text-3xl uppercase tracking-[0.25em] font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-400 via-[#c9a96e] to-neutral-400 group-hover:from-neutral-200 group-hover:via-[#e6d296] group-hover:to-neutral-200 transition-all duration-500">
          Join
        </span>
      </div>
    </Link>
  )
}
