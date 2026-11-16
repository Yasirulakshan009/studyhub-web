import { useState } from "react"
import { Link } from "react-router-dom"
import { getErrorMessage } from "../../service/api"
import { getSummary } from "../../service/note"

const MIN_DELAY_MS = 1500

interface AiSummaryCardProps {
  noteId: string
  saved: boolean
  loggedIn: boolean
}

interface Block {
  kind: "text" | "heading" | "bullet"
  text: string
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const parseSummary = (text: string): Block[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): Block => {
      if (/^[-*•]\s+/.test(line)) {
        return { kind: "bullet", text: line.replace(/^[-*•]\s+/, "") }
      }
      if (/^key points:?$/i.test(line)) {
        return { kind: "heading", text: "Key points" }
      }
      return { kind: "text", text: line }
    })

function SparkleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16v4M17 18h4" />
    </svg>
  )
}

export default function AiSummaryCard({ noteId, saved, loggedIn }: AiSummaryCardProps) {
  const [hasSaved, setHasSaved] = useState(saved)
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const [data] = await Promise.all([getSummary(noteId), wait(hasSaved ? MIN_DELAY_MS : 0)])
      setSummary(data.summary)
      setHasSaved(true)
    } catch (err) {
      setError(getErrorMessage(err, "Could not generate a summary"))
    } finally {
      setLoading(false)
    }
  }

  const blocks = summary ? parseSummary(summary) : []

  return (
    <section
      aria-labelledby="ai-heading"
      className="mt-8 rounded-3xl border border-brand/25 bg-brand/5 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand">
            <SparkleIcon />
          </span>
          <h2 id="ai-heading" className="text-lg font-semibold tracking-tight">
            AI summary
          </h2>
        </div>

        {summary && !loading && (
          <button
            type="button"
            onClick={() => setSummary(null)}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-brand dark:text-slate-400"
          >
            Hide
          </button>
        )}
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="mt-4">
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"
            />
            Reading the PDF and writing a summary...
          </p>
          <div className="mt-4 space-y-3" aria-hidden="true">
            <div className="h-3 w-full animate-pulse rounded-full bg-brand/15" />
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-brand/15" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-brand/15" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-brand/15" />
          </div>
        </div>
      ) : summary ? (
        <div className="mt-4 space-y-2.5 text-sm leading-relaxed">
          {blocks.map((block, index) => {
            const style = { animationDelay: `${index * 90}ms` }

            if (block.kind === "heading") {
              return (
                <p
                  key={index}
                  style={style}
                  className="fade-up pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {block.text}
                </p>
              )
            }

            if (block.kind === "bullet") {
              return (
                <p key={index} style={style} className="fade-up flex gap-2.5 break-words">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span>{block.text}</span>
                </p>
              )
            }

            return (
              <p key={index} style={style} className="fade-up break-words">
                {block.text}
              </p>
            )
          })}

          <p
            style={{ animationDelay: `${blocks.length * 90}ms` }}
            className="fade-up pt-3 text-xs text-slate-500 dark:text-slate-400"
          >
            Generated by AI and may contain mistakes. Review the original PDF before relying on it.
          </p>
        </div>
      ) : loggedIn ? (
        <>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Get a short overview and the key points of this PDF in a few seconds.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button type="button" onClick={handleGenerate} className="btn-primary mt-4">
            <SparkleIcon className="h-4 w-4" />
            Summarize with AI
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/login"
            state={{ from: { pathname: `/notes/${noteId}` } }}
            className="font-medium text-brand hover:underline"
          >
            Log in
          </Link>{" "}
          to generate an AI summary of this note.
        </p>
      )}
    </section>
  )
}