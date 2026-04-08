'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { generateViewerCode } from '@/app/actions/viewer-codes'

export function ViewerCodeForm() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(duration: '24h' | '48h' | '7d' | '30d' | 'forever') {
    setLoading(true)
    setError('')
    setGeneratedCode(null)

    const formData = new FormData()
    formData.set('duration', duration)
    const result = await generateViewerCode(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.code) {
      setGeneratedCode(result.code)
    }

    setLoading(false)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
        Generate New Code
      </h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="outline" onClick={() => handleGenerate('24h')} disabled={loading}>
          24 Hours
        </Button>
        <Button variant="outline" onClick={() => handleGenerate('48h')} disabled={loading}>
          48 Hours
        </Button>
        <Button variant="outline" onClick={() => handleGenerate('7d')} disabled={loading}>
          7 Days
        </Button>
        <Button variant="outline" onClick={() => handleGenerate('30d')} disabled={loading}>
          30 Days
        </Button>
        <Button variant="outline" onClick={() => handleGenerate('forever')} disabled={loading}>
          Forever
        </Button>
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {generatedCode && (
        <div className="rounded-md bg-background border border-gold p-4 text-center">
          <p className="text-xs text-muted mb-1">Share this code with your buyer:</p>
          <p className="text-2xl font-mono font-bold text-gold tracking-[0.2em]">
            {generatedCode}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(generatedCode)}
            className="mt-2 text-xs text-muted hover:text-gold transition-colors cursor-pointer"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </div>
  )
}
