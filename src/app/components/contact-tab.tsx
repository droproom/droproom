'use client'

type ContactData = {
  id: string
  label: string
  url: string
}

export function ContactTab({ contacts }: { contacts: ContactData[] }) {
  return (
    <div className="flex justify-center gap-4 px-6 pb-6 animate-fade-in">
      {contacts.map((contact) => (
        <a
          key={contact.id}
          href={contact.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] uppercase tracking-[0.2em] text-white/40 hover:text-[#c9a96e] transition-colors duration-300"
        >
          {contact.label}
        </a>
      ))}
    </div>
  )
}
