import { useEffect, useRef, type CSSProperties } from "react"

interface Doc {
  pos: CSSProperties
  w: string
  h: string
  rotate: number
  blur: number
  opacity: number
  amp: number
  phase: number
  duration: number
  lines?: boolean
}

const docs: Doc[] = [
  { pos: { left: "4%", top: "14%" }, w: "10rem", h: "13rem", rotate: -18, blur: 0, opacity: 1.1, amp: 40, phase: 0, duration: 9 },
  { pos: { right: "6%", top: "10%" }, w: "7rem", h: "9rem", rotate: 22, blur: 2, opacity: 0.95, amp: 70, phase: 1.6, duration: 11 },
  { pos: { left: "38%", top: "34%" }, w: "14rem", h: "18rem", rotate: 12, blur: 7, opacity: 0.65, amp: 30, phase: 2.4, duration: 14, lines: false },
  { pos: { right: "14%", top: "52%" }, w: "11rem", h: "14rem", rotate: -12, blur: 0, opacity: 0.15, amp: 55, phase: 3.1, duration: 10 },
  { pos: { left: "8%", top: "62%" }, w: "8rem", h: "10rem", rotate: 16, blur: 3, opacity: 0.9, amp: 80, phase: 4.2, duration: 12 },
  { pos: { right: "32%", bottom: "6%" }, w: "9rem", h: "12rem", rotate: -24, blur: 1, opacity: 1, amp: 45, phase: 5, duration: 8 },
  { pos: { left: "26%", top: "4%" }, w: "6rem", h: "8rem", rotate: 28, blur: 4, opacity: 0.8, amp: 90, phase: 5.8, duration: 13 },
  { pos: { right: "2%", bottom: "26%" }, w: "12rem", h: "15rem", rotate: 8, blur: 6, opacity: 0.7, amp: 35, phase: 6.5, duration: 15, lines: false }
]

function Sheet({ lines }: { lines: boolean }) {
  return (
    <div className="relative h-full w-full rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-sky-200/80 via-blue-100/60 to-white/30 shadow-[0_24px_60px_rgba(10,132,255,0.16)] dark:border-white/15 dark:from-sky-400/25 dark:via-indigo-400/15 dark:to-white/5 dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
      <div className="absolute right-0 top-0 h-[24%] w-[24%] rounded-bl-[1.2rem] rounded-tr-[1.6rem] bg-white/70 dark:bg-white/15" />
      {lines && (
        <div className="absolute inset-x-[16%] top-[42%] space-y-[0.7rem]">
          <div className="h-2 w-full rounded-full bg-white/80 dark:bg-white/25" />
          <div className="h-2 w-4/5 rounded-full bg-white/80 dark:bg-white/25" />
          <div className="h-2 w-3/5 rounded-full bg-white/80 dark:bg-white/25" />
        </div>
      )}
    </div>
  )
}

export default function Background() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const y = window.scrollY
      refs.current.forEach((el, i) => {
        if (!el) return
        const { phase, amp } = docs[i]
        const x = Math.sin(y / 500 + phase) * amp
        const dy = Math.cos(y / 600 + phase) * amp
        el.style.transform = `translate3d(${x}px, ${dy}px, 0)`
      })
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {docs.map((doc, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="absolute transition-transform duration-500 ease-out"
          style={doc.pos}
        >
          <div
            className="doc-float"
            style={{ animationDuration: `${doc.duration}s`, animationDelay: `${-doc.phase * 2}s` }}
          >
            <div
              style={{
                width: doc.w,
                height: doc.h,
                transform: `rotate(${doc.rotate}deg)`,
                filter: `blur(${doc.blur}px)`,
                opacity: doc.opacity
              }}
            >
              <Sheet lines={doc.lines ?? true} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}