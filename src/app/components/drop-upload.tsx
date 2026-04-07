'use client'

import { useState, useRef } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Modal } from '@/app/components/ui/modal'
import { getUploadUrl, createDrop } from '@/app/actions/drops'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

export function DropUpload({ currentCount, maxDrops }: { currentCount: number; maxDrops: number }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const atLimit = currentCount >= maxDrops

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    setError('')

    const isVideo = f.type.startsWith('video/')
    const isImage = f.type.startsWith('image/')

    if (!isVideo && !isImage) {
      setError('Only images and videos are allowed.')
      return
    }

    if (isImage && f.size > MAX_IMAGE_SIZE) {
      setError('Images must be under 10MB.')
      return
    }

    if (isVideo && f.size > MAX_VIDEO_SIZE) {
      setError('Videos must be under 50MB.')
      return
    }

    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !name.trim()) return

    setUploading(true)
    setError('')

    try {
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

      // Get signed upload URL
      const urlResult = await getUploadUrl(file.name, file.type)
      if ('error' in urlResult && urlResult.error) {
        setError(urlResult.error)
        setUploading(false)
        return
      }

      // Upload directly to Supabase Storage
      const uploadRes = await fetch(urlResult.signedUrl!, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        setError('Upload failed. Please try again.')
        setUploading(false)
        return
      }

      // Create drop record
      const formData = new FormData()
      formData.set('name', name.trim())
      formData.set('mediaUrl', urlResult.publicUrl!)
      formData.set('mediaType', mediaType)

      const result = await createDrop(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setName('')
        setFile(null)
        setPreview(null)
      }
    } catch {
      setError('Something went wrong.')
    }

    setUploading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={atLimit}>
        {atLimit ? 'Drop Limit Reached' : 'Add Drop'}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Drop">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Strain / Drop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gelato 41"
            required
          />

          <div>
            <label className="text-xs uppercase tracking-widest text-muted block mb-1.5">
              Media
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-md border border-dashed border-border p-8 text-center text-sm text-muted hover:border-gold hover:text-gold transition-colors cursor-pointer"
            >
              {file ? file.name : 'Click to select image or video'}
            </button>
          </div>

          {preview && file && (
            <div className="rounded-md overflow-hidden border border-border">
              {file.type.startsWith('video/') ? (
                <video src={preview} className="w-full aspect-[9/16] object-cover" controls />
              ) : (
                <img src={preview} alt="Preview" className="w-full aspect-square object-cover" />
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={uploading} disabled={!file || !name.trim()}>
            Upload Drop
          </Button>
        </form>
      </Modal>
    </>
  )
}
