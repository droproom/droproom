'use client'

import { useState } from 'react'

export function CodeEntry({ slug }: { slug: string }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/verify-viewer-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), slug }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
        setLoading(false)
        return
      }

      window.location.reload()
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-dvh bg-[#0a0a0a] px-6" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      <div className="w-full max-w-xs text-center">
        <div
          className="mb-12"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0s forwards' }}
        >
          <div className="w-10 h-px bg-[#c9a96e] mx-auto mb-6" />
          <p className="text-[12px] uppercase tracking-[0.3em] text-white/40 font-medium">
            Enter Access Code
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0.15s forwards' }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            maxLength={12}
            required
            className="w-full bg-transparent border-b border-white/20 text-center text-[16px] tracking-[0.25em] font-medium text-white py-3 placeholder:text-white/20 focus:border-[#c9a96e] focus:outline-none transition-colors duration-300"
          />

          {error && (
            <p className="text-[12px] text-red-400/80">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="text-[12px] uppercase tracking-[0.25em] text-[#c9a96e] hover:text-white transition-colors duration-300 py-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(1.5rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
