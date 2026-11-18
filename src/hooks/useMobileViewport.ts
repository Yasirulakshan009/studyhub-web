import { useEffect, useState } from "react"

interface ViewportBox {
  height: number
  top: number
}


export function useMobileViewport(active = true, breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`

  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(query).matches
  )
  const [viewport, setViewport] = useState<ViewportBox | null>(null)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setIsMobile(media.matches)

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  useEffect(() => {
    const vv = window.visualViewport

    if (!isMobile || !active || !vv) {
      setViewport(null)
      return
    }

    const update = () => {
      setViewport({ height: vv.height, top: vv.offsetTop })

      if (window.scrollY !== 0) window.scrollTo(0, 0)
    }

    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)

    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [isMobile, active])

  return { isMobile, viewport }
}