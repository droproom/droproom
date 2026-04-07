'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { addContact, deleteContact } from '@/app/actions/contacts'
import type { BrandContact } from '@/lib/types'

export function ContactForm({ contacts }: { contacts: BrandContact[] }) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const atLimit = contacts.length >= 3

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.set('label', label)
    formData.set('url', url)

    const result = await addContact(formData)
    if (result.error) {
      setError(result.error)
    } else {
      setLabel('')
      setUrl('')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteContact(id)
  }

  return (
    <div>
      {/* Existing contacts */}
      <div className="flex flex-col gap-3 mb-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{contact.label}</p>
              <p className="text-xs text-muted truncate max-w-xs">{contact.url}</p>
            </div>
            <button
              onClick={() => handleDelete(contact.id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add new contact */}
      {!atLimit && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
            Add Contact Method
          </h3>
          <div className="flex flex-col gap-3">
            <Input
              label="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Signal, Telegram, Phone"
              required
            />
            <Input
              label="Link / Number"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://t.me/yourname or +1234567890"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading}>
              Add Contact
            </Button>
          </div>
        </form>
      )}

      {atLimit && (
        <p className="text-sm text-muted">Maximum 3 contact methods reached.</p>
      )}
    </div>
  )
}
