'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { generateInviteCode } from '@/app/actions/owner'
import type { BrandInviteCode } from '@/lib/types'

export function InviteCodeGen({ existingCodes }: { existingCodes: BrandInviteCode[] }) {
  const [newCode, setNewCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const result = await generateInviteCode()
    if (result.code) setNewCode(result.code)
    setLoading(false)
  }

  const unusedCodes = existingCodes.filter((c) => !c.used)

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Brand Invite Codes
        </h2>
        <Button onClick={handleGenerate} loading={loading}>
          Generate Code
        </Button>
      </div>

      {newCode && (
        <div className="rounded-md bg-background border border-gold p-4 text-center mb-4">
          <p className="text-xs text-muted mb-1">New invite code:</p>
          <p className="text-xl font-mono font-bold text-gold tracking-[0.2em]">
            {newCode}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(newCode)}
            className="mt-2 text-xs text-muted hover:text-gold transition-colors cursor-pointer"
          >
            Copy to clipboard
          </button>
        </div>
      )}

      {unusedCodes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">Unused codes:</p>
          {unusedCodes.map((code) => (
            <div
              key={code.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <span className="font-mono text-sm tracking-[0.1em]">{code.code}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code.code)}
                className="text-xs text-muted hover:text-gold transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
