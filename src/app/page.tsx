import { ConstellationBg } from '@/app/components/constellation-bg'
import { SpecialText } from '@/app/components/ui/special-text'
import { JoinButton } from '@/app/components/join-button'

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center min-h-dvh overflow-hidden">
      <ConstellationBg />
      <div className="relative z-10 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.3em] uppercase mb-2">
          <SpecialText speed={25} delay={0.5} className="text-5xl sm:text-7xl font-bold tracking-[0.3em] uppercase">
            DROPROOM
          </SpecialText>
        </h1>
        <div className="w-16 h-px bg-gold mx-auto mb-16 animate-fade-in-delay" />
      </div>
      <div className="relative z-10 animate-fade-in-delay">
        <JoinButton />
      </div>
    </div>
  )
}
