'use client'

import { useState } from 'react'
import { deleteDrop, renameDrop } from '@/app/actions/drops'
import type { Drop } from '@/lib/types'

export function DropCard({ drop }: { drop: Drop }) {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(drop.name)
  const [saving, setSaving] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this drop?')) return
    setDeleting(true)
    await deleteDrop(drop.id)
    setDeleting(false)
  }

  async function handleRename() {
    if (!name.trim() || name.trim() === drop.name) {
      setEditing(false)
      setName(drop.name)
      return
    }
    setSaving(true)
    await renameDrop(drop.id, name.trim())
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="group relative rounded-lg border border-border bg-surface overflow-hidden">
      {drop.media_type === 'video' ? (
        <video
          src={drop.media_url}
          className="w-full aspect-[9/16] object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={drop.media_url}
          alt={drop.name}
          className="w-full aspect-square object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {editing ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleRename() }}
            className="flex gap-2"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-black/50 border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-gold"
              autoFocus
              onBlur={handleRename}
              disabled={saving}
            />
          </form>
        ) : (
          <p
            onClick={() => setEditing(true)}
            className="text-sm font-semibold uppercase tracking-wide truncate cursor-pointer hover:text-gold transition-colors"
            title="Click to rename"
          >
            {drop.name}
          </p>
        )}
        <div className="flex gap-3 mt-1">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-muted hover:text-white transition-colors cursor-pointer"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
