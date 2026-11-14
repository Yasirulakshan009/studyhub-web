import { useEffect, useRef, useState } from "react"
import { getErrorMessage } from "../../service/api"
import { getPreviewUrl } from "../../service/note"

const MAX_PAGES = 40

type ViewerState =
  | { status: "loading" }
  | { status: "ready"; total: number; shown: number }
  | { status: "error"; message: string }

export default function PdfViewer({ noteId }: { noteId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ViewerState>({ status: "loading" })
  const [rendered, setRendered] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    container.replaceChildren()

    const run = async () => {
      try {
        const url = await getPreviewUrl(noteId)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Could not fetch the file")
        }
        const data = new Uint8Array(await response.arrayBuffer())

        const pdfjs = await import("pdfjs-dist")
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default

        const pdf = await pdfjs.getDocument({ data }).promise
        if (cancelled) return

        const shown = Math.min(pdf.numPages, MAX_PAGES)
        setState({ status: "ready", total: pdf.numPages, shown })

        const width = container.clientWidth
        const ratio = window.devicePixelRatio || 1

        for (let number = 1; number <= shown; number++) {
          const page = await pdf.getPage(number)
          if (cancelled) return

          const base = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: (width / base.width) * ratio })

          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = "100%"
          canvas.style.height = "auto"
          canvas.className = "mb-4 rounded-xl bg-white shadow-md"
          canvas.setAttribute("role", "img")
          canvas.setAttribute("aria-label", `Page ${number} of ${pdf.numPages}`)
          container.appendChild(canvas)

          const context = canvas.getContext("2d")
          if (!context) {
            throw new Error("Canvas is not supported")
          }

          await page.render({ canvasContext: context, viewport }).promise
          if (!cancelled) setRendered(number)
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: getErrorMessage(error, "Could not display this PDF. Use Download instead.")
          })
        }
      }
    }

    run()

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [noteId])

  return (
    <div>
      {state.status === "loading" && (
        <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500 dark:text-slate-400">
          <div
            role="status"
            aria-label="Loading preview"
            className="h-6 w-6 animate-spin rounded-full border-4 border-brand border-t-transparent"
          />
          Loading preview...
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {state.message}
        </p>
      )}

      {state.status === "ready" && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {rendered < state.shown
            ? `Rendering page ${rendered + 1} of ${state.shown}...`
            : state.total > state.shown
              ? `Showing the first ${state.shown} of ${state.total} pages. Download the PDF to read the rest.`
              : `${state.total} ${state.total === 1 ? "page" : "pages"}`}
        </p>
      )}

      <div ref={containerRef} />
    </div>
  )
}