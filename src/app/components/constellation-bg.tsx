'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  id: number
  x: number
  y: number
  opacity: number
  scale: number
  createdAt: number
}

interface Line {
  from: Dot
  to: Dot
  progress: number
}

export function ConstellationBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const linesRef = useRef<Line[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastDotTimeRef = useRef<number>(0)
  const nextDotIdRef = useRef<number>(0)

  const DOT_INTERVAL = 800
  const MAX_DOTS = 50
  const DOT_SIZE = 4
  const LINE_WIDTH = 1
  const GLOW_BLUR = 15
  const PULSE_DURATION = 1000
  const LINE_DRAW_DURATION = 800

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const findNearestDot = (newDot: Dot, existingDots: Dot[]): Dot | null => {
      if (existingDots.length === 0) return null

      let nearest = existingDots[0]
      let minDistance = Infinity

      existingDots.forEach((dot) => {
        const dx = dot.x - newDot.x
        const dy = dot.y - newDot.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance) {
          minDistance = distance
          nearest = dot
        }
      })

      return nearest
    }

    const addDot = (currentTime: number) => {
      if (dotsRef.current.length >= MAX_DOTS) return

      const newDot: Dot = {
        id: nextDotIdRef.current++,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: 0,
        scale: 0,
        createdAt: currentTime,
      }

      const nearestDot = findNearestDot(newDot, dotsRef.current)

      dotsRef.current.push(newDot)

      if (nearestDot) {
        linesRef.current.push({
          from: nearestDot,
          to: newDot,
          progress: 0,
        })
      }
    }

    const drawDot = (dot: Dot, currentTime: number) => {
      const age = currentTime - dot.createdAt
      const pulseProgress = Math.min(age / PULSE_DURATION, 1)

      dot.opacity = pulseProgress
      dot.scale = pulseProgress

      ctx.save()
      ctx.shadowBlur = GLOW_BLUR
      ctx.shadowColor = 'rgba(201, 169, 78, 0.8)'
      ctx.fillStyle = `rgba(201, 169, 78, ${dot.opacity * 0.9})`

      ctx.beginPath()
      ctx.arc(dot.x, dot.y, DOT_SIZE * dot.scale, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = GLOW_BLUR * 2
      ctx.fillStyle = `rgba(230, 210, 150, ${dot.opacity * 0.5})`
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, DOT_SIZE * dot.scale * 0.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawLine = (line: Line, currentTime: number) => {
      const age = currentTime - line.to.createdAt
      const lineProgress = Math.min(age / LINE_DRAW_DURATION, 1)
      line.progress = lineProgress

      if (lineProgress <= 0) return

      const currentX = line.from.x + (line.to.x - line.from.x) * lineProgress
      const currentY = line.from.y + (line.to.y - line.from.y) * lineProgress

      ctx.save()
      ctx.shadowBlur = GLOW_BLUR * 0.5
      ctx.shadowColor = 'rgba(201, 169, 78, 0.6)'
      ctx.strokeStyle = `rgba(201, 169, 78, ${0.4 * line.to.opacity})`
      ctx.lineWidth = LINE_WIDTH

      ctx.beginPath()
      ctx.moveTo(line.from.x, line.from.y)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      ctx.restore()
    }

    const animate = (currentTime: number) => {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (currentTime - lastDotTimeRef.current > DOT_INTERVAL) {
        addDot(currentTime)
        lastDotTimeRef.current = currentTime
      }

      linesRef.current.forEach((line) => {
        drawLine(line, currentTime)
      })

      dotsRef.current.forEach((dot) => {
        drawDot(dot, currentTime)
      })

      if (dotsRef.current.length >= MAX_DOTS) {
        const oldestDotTime = dotsRef.current[0].createdAt
        const resetDelay = 3000

        if (currentTime - oldestDotTime > PULSE_DURATION + resetDelay) {
          dotsRef.current = []
          linesRef.current = []
          lastDotTimeRef.current = currentTime
          nextDotIdRef.current = 0
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
