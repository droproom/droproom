'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { updateTagline } from '@/app/actions/brand'

export function TaglineEditor({ currentTagline }: { currentTagline: string | null }) {
  const [tagline, setTagline] = useState(currentTagline ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    await updateTagline(tagline.trim() || null)
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-1">
        Tagline
      </h2>
      <p className="text-xs text-muted mb-4">
        Shows below your brand name on your public page.
      </p>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder='e.g. "Where Boutique Meets Wholesale"'
            maxLength={60}
          />
        </div>
        <Button onClick={handleSave} loading={loading} variant="outline">
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
