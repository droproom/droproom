'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  id: number
  x: number
  y: number
  opacity: number
  scale: number
  createdAt: number
  children: number // how many times this dot has branched
  branch: number   // which of the 6 original branches this belongs to
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
  const frontierRef = useRef<Dot[]>([]) // dots that can still branch
  const branchAnglesRef = useRef<number[]>([]) // base angle for each of the 6 branches

  // --- Tuning knobs ---
  const DOT_INTERVAL = 2000      // ms between growth ticks (all 6 branches grow each tick)
  const MAX_DOTS = 200
  const DOT_SIZE = 3.5
  const LINE_WIDTH = 1
  const GLOW_BLUR = 15
  const PULSE_DURATION = 1200
  const LINE_DRAW_DURATION = 1500
  const MAX_CHILDREN = 2          // max branches per dot

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

    // Scale all distances proportionally to screen size (baseline: 900px)
    const screenScale = Math.min(canvas.width, canvas.height) / 900

    // How many initial branches radiate from origin
    const ORIGIN_BRANCHES = 6

    // Seed the origin at the JOIN button and burst 6 branches in all directions
    const seedOrigin = (currentTime: number) => {
      // Origin sits at JOIN button position (~center-x, ~58% down)
      const origin: Dot = {
        id: nextDotIdRef.current++,
        x: canvas.width * 0.5,
        y: canvas.height * 0.58,
        opacity: 0,
        scale: 0,
        createdAt: currentTime,
        children: 0,
        branch: -1,
      }
      dotsRef.current = [origin]
      linesRef.current = []
      frontierRef.current = []
      branchAnglesRef.current = []

      // Spawn 4 sub-branches fanning out from a parent dot
      const SUB_BRANCHES = 4
      const FAN_SPREAD = Math.PI * 0.8 // ±72°
      const spawnLayer = (parent: Dot, baseAngle: number, branchIdx: number, timeOffset: number, layer: number) => {
        const subs: Dot[] = []
        for (let j = 0; j < SUB_BRANCHES; j++) {
          const subAngle = baseAngle + (j / (SUB_BRANCHES - 1) - 0.5) * FAN_SPREAD
          const baseDist = (80 + Math.random() * 60) * screenScale // 80–140px scaled
          const subDist = layer === 0 ? baseDist * 2 : baseDist // double for first layer
          const sub: Dot = {
            id: nextDotIdRef.current++,
            x: parent.x + Math.cos(subAngle) * subDist,
            y: parent.y + Math.sin(subAngle) * subDist,
            opacity: 0,
            scale: 0,
            createdAt: timeOffset + (j + 1) * 400,
            children: 0,
            branch: branchIdx,
          }
          parent.children++
          dotsRef.current.push(sub)
          frontierRef.current.push(sub)
          linesRef.current.push({ from: parent, to: sub, progress: 0 })
          subs.push(sub)
        }
        return subs
      }

      // Pick the sub-branch closest to the base angle (most "on path")
      const pickBestChild = (subs: Dot[], parent: Dot, baseAngle: number): Dot => {
        let best = subs[0]
        let bestDiff = Infinity
        for (const s of subs) {
          const childAngle = Math.atan2(s.y - parent.y, s.x - parent.x)
          let diff = Math.abs(childAngle - baseAngle)
          if (diff > Math.PI) diff = Math.PI * 2 - diff
          if (diff < bestDiff) {
            bestDiff = diff
            best = s
          }
        }
        return best
      }

      // 6 spokes evenly spaced (every 60°)
      const LAYERS = 3 // how many generations deep to pre-build
      for (let i = 0; i < ORIGIN_BRANCHES; i++) {
        const angle = (i / ORIGIN_BRANCHES) * Math.PI * 2
        branchAnglesRef.current.push(angle)
        const distance = (244 + Math.random() * 140) * screenScale
        const spoke: Dot = {
          id: nextDotIdRef.current++,
          x: origin.x + Math.cos(angle) * distance,
          y: origin.y + Math.sin(angle) * distance,
          opacity: 0,
          scale: 0,
          createdAt: currentTime + i * 500,
          children: 0,
          branch: i,
        }
        origin.children++
        dotsRef.current.push(spoke)
        linesRef.current.push({ from: origin, to: spoke, progress: 0 })

        // Build layers: spoke → 4 subs → pick best → 4 more subs → pick best → 4 more
        let currentParent = spoke
        let layerTime = currentTime + i * 200
        for (let layer = 0; layer < LAYERS; layer++) {
          layerTime += SUB_BRANCHES * 400
          const subs = spawnLayer(currentParent, angle, i, layerTime, layer)
          if (subs.length === 0) break
          // Pick the child most aligned with the branch direction to continue
          currentParent = pickBestChild(subs, currentParent, angle)
        }
      }
    }

    const pickDistance = (): number => {
      return (80 + Math.random() * 80) * screenScale // 80–160px scaled
    }

    // Check if a position is too close to any existing dot
    const MIN_DOT_SPACING = 55 * screenScale
    const isTooClose = (x: number, y: number): boolean => {
      for (const dot of dotsRef.current) {
        const dx = dot.x - x
        const dy = dot.y - y
        if (dx * dx + dy * dy < MIN_DOT_SPACING * MIN_DOT_SPACING) {
          return true
        }
      }
      return false
    }

    // Spawn a child dot branching off a parent
    const branchFrom = (parent: Dot, currentTime: number) => {
      const cx = canvas.width * 0.5
      const cy = canvas.height * 0.58
      const dx = parent.x - cx
      const dy = parent.y - cy

      // Use the dot's actual outward angle from origin — clean directional growth
      const actualOutward = Math.atan2(dy, dx)
      const angle = actualOutward + (Math.random() - 0.5) * Math.PI * 0.33

      const distance = pickDistance()

      const newX = parent.x + Math.cos(angle) * distance
      const newY = parent.y + Math.sin(angle) * distance

      // Keep within canvas bounds (with padding)
      if (newX < 20 || newX > canvas.width - 20 || newY < 20 || newY > canvas.height - 20) {
        return
      }

      // Don't place on top of existing dots
      if (isTooClose(newX, newY)) {
        return
      }

      const child: Dot = {
        id: nextDotIdRef.current++,
        x: newX,
        y: newY,
        opacity: 0,
        scale: 0,
        createdAt: currentTime,
        children: 0,
        branch: parent.branch,
      }

      parent.children++
      dotsRef.current.push(child)
      frontierRef.current.push(child)

      linesRef.current.push({
        from: parent,
        to: child,
        progress: 0,
      })
    }

    const growNetwork = (currentTime: number) => {
      if (dotsRef.current.length >= MAX_DOTS) return
      if (frontierRef.current.length === 0) return

      // Each branch grows independently on every tick — all 6 expand together
      for (let b = 0; b < ORIGIN_BRANCHES; b++) {
        if (dotsRef.current.length >= MAX_DOTS) break

        // Get available frontier dots for this branch
        const branchFrontier = frontierRef.current.filter(
          (d) => d.branch === b && d.children < MAX_CHILDREN
        )
        if (branchFrontier.length === 0) continue

        // Pick a random frontier dot (not just outermost — encourages forking)
        const parent = branchFrontier[Math.floor(Math.random() * branchFrontier.length)]

        // Branch once
        branchFrom(parent, currentTime)

        // 30% chance of a second branch — keeps it clean
        if (
          Math.random() < 0.3 &&
          parent.children < MAX_CHILDREN &&
          dotsRef.current.length < MAX_DOTS
        ) {
          branchFrom(parent, currentTime)
        }

        // Remove parent from frontier if maxed out
        if (parent.children >= MAX_CHILDREN) {
          frontierRef.current = frontierRef.current.filter(
            (d) => d.id !== parent.id
          )
        }
      }
    }

    const drawDot = (dot: Dot, currentTime: number) => {
      const age = currentTime - dot.createdAt
      if (age < 0) return // not born yet (staggered appearance)
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

      // Inner bright core
      ctx.shadowBlur = GLOW_BLUR * 2
      ctx.fillStyle = `rgba(230, 210, 150, ${dot.opacity * 0.5})`
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, DOT_SIZE * dot.scale * 0.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawLine = (line: Line, currentTime: number) => {
      const age = currentTime - line.to.createdAt
      if (age < 0) return // not born yet
      const lineProgress = Math.min(age / LINE_DRAW_DURATION, 1)
      line.progress = lineProgress

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

    let initialized = false
    let startTime = 0

    const animate = (currentTime: number) => {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (startTime === 0) startTime = currentTime

      // Wait 1.5 seconds before starting
      if (currentTime - startTime < 1500) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      // Seed origin after 1.5s delay
      if (!initialized) {
        seedOrigin(currentTime)
        lastDotTimeRef.current = currentTime
        initialized = true
      }

      // Grow the network over time
      if (currentTime - lastDotTimeRef.current > DOT_INTERVAL) {
        growNetwork(currentTime)
        lastDotTimeRef.current = currentTime
      }

      linesRef.current.forEach((line) => {
        drawLine(line, currentTime)
      })

      dotsRef.current.forEach((dot) => {
        drawDot(dot, currentTime)
      })

      // Reset and regrow once network is full and has been visible a while
      if (dotsRef.current.length >= MAX_DOTS || frontierRef.current.length === 0) {
        const lastDot = dotsRef.current[dotsRef.current.length - 1]
        const timeSinceLast = currentTime - lastDot.createdAt

        if (timeSinceLast > 3000) {
          initialized = false
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
