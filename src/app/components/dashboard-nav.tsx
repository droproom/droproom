'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import type { Brand } from '@/lib/types'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/drops', label: 'Drops' },
  { href: '/dashboard/codes', label: 'Viewer Codes' },
  { href: '/dashboard/contacts', label: 'Contacts' },
  { href: '/dashboard/analytics', label: 'Analytics' },
]

export function DashboardNav({ brand }: { brand: Brand }) {
  const pathname = usePathname()

  return (
    <nav className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-surface">
      <div className="p-5">
        <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase text-gold">
          Droproom
        </Link>
        <p className="text-xs text-muted mt-1 truncate">{brand.name}</p>
      </div>

      <div className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 pb-2 md:pb-0 gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-surface-hover text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        {brand.is_owner && (
          <Link
            href="/owner"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-gold hover:bg-surface-hover transition-colors"
          >
            Owner Panel
          </Link>
        )}

        <form action={logout} className="md:hidden">
          <button
            type="submit"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="hidden md:block mt-auto p-4 border-t border-border">
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Log out
          </button>
        </form>
      </div>
    </nav>
  )
}
