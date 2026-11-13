import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingSpinner from "../components/common/LoadingSpinner"
import StatusBadge from "../components/common/StatusBadge"
import { useAuth } from "../hooks/useAuth"
import { getErrorMessage } from "../service/api"
import { getDownloadUrl, getNoteById } from "../service/note"
import type { Note } from "../types"
import { formatDate, formatSize, refName } from "../utils/format"

interface Result {
  id: string
  note: Note | null
  notFound: boolean
}

export default function NoteDetailPage() {
  const { id = "" } = useParams()
  const { user } = useAuth()

  const [result, setResult] = useState<Result | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [extraDownloads, setExtraDownloads] = useState(0)

  useEffect(() => {
    let cancelled = false

    getNoteById(id)
      .then((note) => {
        if (!cancelled) setResult({ id, note, notFound: false })
      })
      .catch((error) => {
        const notFound = axios.isAxiosError(error) && error.response?.status === 404
        if (!cancelled) setResult({ id, note: null, notFound })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError(null)

    try {
      const url = await getDownloadUrl(id)
      window.location.href = url
      setExtraDownloads((count) => count + 1)
    } catch (error) {
      setDownloadError(getErrorMessage(error, "Could not start the download"))
    } finally {
      setDownloading(false)
    }
  }

  if (result?.id !== id) {
    return <LoadingSpinner label="Loading note" />
  }

  if (!result.note) {
    return (
      <div className="glass mx-auto max-w-lg rounded-[2rem] px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {result.notFound ? "Note not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {result.notFound
            ? "This note does not exist, or it has not been approved yet."
            : "We could not load this note. Please try again in a moment."}
        </p>
        <Link to="/browse" className="btn-primary mt-6">
          Back to browse
        </Link>
      </div>
    )
  }

  const note = result.note
  const category = refName(note.categoryId)
  const uploader = refName(note.uploaderId)

  return (
    <div>
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <span aria-hidden="true">←</span> Back to browse
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <article className="glass rounded-[2rem] p-6 sm:p-8 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {category}
              </span>
            )}
            {note.subject && (
              <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {note.subject}
              </span>
            )}
            {note.status !== "APPROVED" && <StatusBadge status={note.status} />}
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {note.title}
          </h1>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {[uploader && `Shared by ${uploader}`, formatDate(note.createdAt)]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About this note
          </h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{note.description}</p>

          {note.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/browse?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-slate-300 bg-white/50 px-3 py-1 text-xs font-medium transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside className="glass h-fit rounded-[2rem] p-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-sm font-bold text-brand">
              PDF
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{note.file?.originalName ?? "Document"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {note.file ? formatSize(note.file.sizeBytes) : "PDF"}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Downloads</dt>
              <dd className="font-medium">{note.downloadCount + extraDownloads}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Uploaded</dt>
              <dd className="font-medium">{formatDate(note.createdAt)}</dd>
            </div>
          </dl>

          {note.file ? (
            user ? (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary mt-6 w-full"
              >
                {downloading ? "Preparing download..." : "Download PDF"}
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: `/notes/${id}` } }}
                className="btn-primary mt-6 w-full"
              >
                Log in to download
              </Link>
            )
          ) : (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              No file is attached to this note.
            </p>
          )}

          {downloadError && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {downloadError}
            </p>
          )}

          {!user && note.file && (
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Free for all students. An account takes less than a minute.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}