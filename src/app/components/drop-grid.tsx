'use client'

import { useEffect, useState } from 'react'
import { ContactTab } from '@/app/components/contact-tab'

type DropData = {
  id: string
  name: string
  media_url: string
  media_type: 'image' | 'video'
  sort_order: number
}

type ContactData = {
  id: string
  label: string
  url: string
  sort_order: number
}

type BrandData = {
  name: string
  slug: string
  hero_video_url: string | null
  tagline: string | null
}

export function DropGrid({ slug }: { slug: string }) {
  const [brand, setBrand] = useState<BrandData | null>(null)
  const [drops, setDrops] = useState<DropData[]>([])
  const [contacts, setContacts] = useState<ContactData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showContacts, setShowContacts] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/brand/${slug}`)
        if (!res.ok) {
          if (res.status === 401) {
            window.location.reload()
            return
          }
          setError('Failed to load')
          return
        }
        const data = await res.json()
        setBrand(data.brand)
        setDrops(data.drops)
        setContacts(data.contacts)
      } catch {
        setError('Failed to load')
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#0a0a0a]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#c9a96e] border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#0a0a0a]">
        <p className="text-white/40 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white antialiased" style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      {/* Header */}
      <header className="flex flex-col items-center justify-center pt-16 md:pt-24 pb-6 px-6 md:px-12">
        <h1
          className="text-[36px] md:text-[52px] font-bold uppercase tracking-[0.3em] text-center"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0s forwards' }}
        >
          {brand?.name}
        </h1>
        {brand?.tagline && (
          <p
            className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] text-white/40 font-medium mt-3"
            style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0.1s forwards' }}
          >
            {brand.tagline}
          </p>
        )}
        <div
          className="w-12 h-px bg-[#c9a96e] mt-4"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0.15s forwards' }}
        />
      </header>

      {/* Hero Video */}
      {brand?.hero_video_url && (
        <div
          className="flex justify-center px-6 md:px-12 mb-12 md:mb-16"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0.2s forwards' }}
        >
          <div className="w-full max-w-sm rounded-sm overflow-hidden">
            <video
              src={brand.hero_video_url}
              className="w-full aspect-[9/16] object-cover"
              autoPlay
              muted
              controls
              playsInline
            />
          </div>
        </div>
      )}

      {/* Section title */}
      {drops.length > 0 && (
        <div
          className="flex flex-col items-center mb-8 md:mb-12"
          style={{ opacity: 0, animation: 'fadeSlideUp 0.7s ease-out 0.3s forwards' }}
        >
          <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 font-medium">
            Latest Drop
          </p>
        </div>
      )}

      {/* Drop grid */}
      <div className="px-6 md:px-12 pb-16 md:pb-24">
        {drops.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/40 text-[13px]">No drops yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
            {drops.map((drop, i) => (
              <div
                key={drop.id}
                className="group"
                style={{
                  opacity: 0,
                  animation: `fadeSlideUp 0.7s ease-out ${0.4 + i * 0.1}s forwards`,
                }}
              >
                <div className="relative rounded-sm overflow-hidden">
                  {/* Media */}
                  {drop.media_type === 'video' ? (
                    <video
                      src={drop.media_url}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.target as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0
                      }}
                    />
                  ) : (
                    <img
                      src={drop.media_url}
                      alt={drop.name}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="mt-4 text-[15px] font-medium uppercase tracking-[0.25em] text-white/80 group-hover:text-white transition-colors duration-300">
                  {drop.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact section */}
      {contacts.length > 0 && (
        <div className="flex flex-col items-center pb-16 md:pb-24">
          <button
            onClick={() => setShowContacts(!showContacts)}
            className="text-[12px] uppercase tracking-[0.25em] text-[#c9a96e] hover:text-white transition-colors duration-300 cursor-pointer mb-4"
          >
            {showContacts ? 'Close' : 'Contact'}
          </button>
          {showContacts && <ContactTab contacts={contacts} />}
        </div>
      )}

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
