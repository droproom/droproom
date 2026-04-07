'use client'

import { useState, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { getHeroUploadUrl, setHeroVideo, removeHeroVideo } from '@/app/actions/drops'

const MAX_VIDEO_SIZE = 50 * 1024 * 1024

export function HeroVideoUpload({ currentUrl }: { currentUrl: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Only video files are allowed.')
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError('Video must be under 50MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const urlResult = await getHeroUploadUrl(file.name)
      if (urlResult.error) {
        setError(urlResult.error)
        setUploading(false)
        return
      }

      const uploadRes = await fetch(urlResult.signedUrl!, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        setError('Upload failed. Try again.')
        setUploading(false)
        return
      }

      await setHeroVideo(urlResult.publicUrl!)
    } catch {
      setError('Something went wrong.')
    }

    setUploading(false)
  }

  async function handleRemove() {
    if (!confirm('Remove hero video?')) return
    setUploading(true)
    await removeHeroVideo()
    setUploading(false)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
        Hero Video
      </h2>
      <p className="text-xs text-muted mb-4">
        This video appears prominently at the top of your public page, above your drops.
      </p>

      {currentUrl ? (
        <div>
          <video
            src={currentUrl}
            className="w-full max-w-sm aspect-[9/16] object-cover rounded-md border border-border mb-3"
            muted
            playsInline
            controls
            preload="metadata"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
            <Button variant="danger" onClick={handleRemove} disabled={uploading}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-sm aspect-[9/16] rounded-md border border-dashed border-border flex items-center justify-center text-sm text-muted hover:border-gold hover:text-gold transition-colors cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Click to upload 9:16 video'}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    </div>
  )
}
