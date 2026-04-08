'use client'

import { revokeViewerCode } from '@/app/actions/viewer-codes'
import type { ViewerCode } from '@/lib/types'

function getStatus(code: ViewerCode): { label: string; color: string } {
  if (code.revoked) return { label: 'Revoked', color: 'text-red-400' }
  if (code.expires_at && new Date(code.expires_at) < new Date()) return { label: 'Expired', color: 'text-muted' }
  return { label: 'Active', color: 'text-green-400' }
}

function formatExpiry(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ViewerCodeList({ codes }: { codes: ViewerCode[] }) {
  if (codes.length === 0) {
    return (
      <p className="text-sm text-muted">No viewer codes generated yet.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {codes.map((code) => {
        const status = getStatus(code)
        const isActive = !code.revoked && (!code.expires_at || new Date(code.expires_at) > new Date())

        return (
          <div
            key={code.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="font-mono text-sm tracking-[0.15em]">{code.code}</p>
              <p className="text-xs text-muted mt-0.5">
                {code.expires_at ? `Expires ${formatExpiry(code.expires_at)}` : 'Never expires'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium uppercase ${status.color}`}>
                {status.label}
              </span>
              {isActive && (
                <button
                  onClick={() => revokeViewerCode(code.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
