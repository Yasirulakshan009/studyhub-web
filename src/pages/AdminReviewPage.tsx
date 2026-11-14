import { useEffect, useState } from "react"
import EmptyState from "../components/common/EmptyState"
import Pagination from "../components/common/Pagination"
import TextAreaField from "../components/forms/TextAreaField"
import PdfViewer from "../components/note/PdfViewer"
import { getErrorMessage } from "../service/api"
import { getPendingNotes, reviewNote, type ReviewInput } from "../service/note"
import type { Note, Paginated } from "../types"
import { formatDate, formatSize, refName } from "../utils/format"

const PAGE_SIZE = 10

const outlineButton =
  "rounded-full border border-slate-300 bg-white/50 px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand disabled:opacity-50 dark:border-white/20 dark:bg-white/10"

interface Result {
  key: string
  data: Paginated<Note> | null
  error: boolean
}

interface RejectDialogProps {
  note: Note
  loading: boolean
  error: string | null
  onSubmit: (reason: string) => void
  onCancel: () => void
}

function RejectDialog({ note, loading, error, onSubmit, onCancel }: RejectDialogProps) {
  const [reason, setReason] = useState("")
  const [fieldError, setFieldError] = useState<string | undefined>()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [loading, onCancel])

  const handleSubmit = () => {
    const clean = reason.trim()
    if (clean.length < 3) {
      setFieldError("Please give a reason (3 to 300 characters)")
      return
    }
    setFieldError(undefined)
    onSubmit(clean)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onClick={() => {
        if (!loading) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-title"
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md rounded-[2rem] bg-white/90 p-7 dark:bg-slate-900/90"
      >
        <h2 id="reject-title" className="text-xl font-semibold tracking-tight">
          Reject this note?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          “{note.title}”. The uploader will see your reason and can fix the note and submit it again.
        </p>

        <div className="mt-5">
          <TextAreaField
            label="Reason"
            id="reject-reason"
            rows={4}
            maxLength={300}
            placeholder="e.g. The scan is unreadable, please upload a clearer copy."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setFieldError(undefined)
            }}
            error={fieldError}
            autoFocus
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-slate-300 bg-white/50 px-5 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50 dark:border-white/20 dark:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Rejecting..." : "Reject note"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminReviewPage() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const [rejecting, setRejecting] = useState<Note | null>(null)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectError, setRejectError] = useState<string | null>(null)

  const key = `${page}|${reloadKey}`

  useEffect(() => {
    let cancelled = false

    getPendingNotes(page, PAGE_SIZE)
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ key, data: null, error: true })
      })

    return () => {
      cancelled = true
    }
  }, [key, page])

  const loading = result?.key !== key
  const notes = result?.data?.items ?? []
  const total = result?.data?.total ?? 0
  const totalPages = result?.data?.totalPages ?? 1

  const afterReview = (text: string) => {
    setMessage(text)
    setPreviewId(null)
    if (notes.length === 1 && page > 1) {
      setPage(page - 1)
    } else {
      setReloadKey((current) => current + 1)
    }
  }

  const togglePreview = (noteId: string) => {
    const next = previewId === noteId ? null : noteId
    setPreviewId(next)

    if (next) {
      window.setTimeout(() => {
        document
          .getElementById(`preview-${noteId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 80)
    }
  }

  const submitReview = async (note: Note, input: ReviewInput) => {
    await reviewNote(note._id, input)
    afterReview(
      input.status === "APPROVED" ? `Approved “${note.title}”.` : `Rejected “${note.title}”.`
    )
  }

  const handleApprove = async (note: Note) => {
    setBusyId(note._id)
    setMessage(null)
    setActionError(null)

    try {
      await submitReview(note, { status: "APPROVED" })
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not approve this note"))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejecting) return

    setRejectLoading(true)
    setRejectError(null)

    try {
      await submitReview(rejecting, { status: "REJECTED", rejectionReason: reason })
      setRejecting(null)
    } catch (error) {
      setRejectError(getErrorMessage(error, "Could not reject this note"))
    } finally {
      setRejectLoading(false)
    }
  }

  const closeReject = () => {
    setRejecting(null)
    setRejectError(null)
  }

  return (
    <div>
      <header className="pt-2">
        <h1 className="text-4xl font-semibold tracking-tight">Pending review</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {loading || result?.error
            ? "Check each upload before it goes public."
            : `${total} ${total === 1 ? "note is" : "notes are"} waiting for review, oldest first.`}
        </p>
      </header>

      {message && (
        <p
          role="status"
          className="mt-5 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {message}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {actionError}
        </p>
      )}

      <section className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass h-44 animate-pulse rounded-[1.75rem]" />
            ))}
          </div>
        ) : result?.error ? (
          <p
            role="alert"
            className="glass rounded-[2rem] px-6 py-8 text-center text-slate-500 dark:text-slate-400"
          >
            Could not load pending notes right now. Please try again in a moment.
          </p>
        ) : notes.length === 0 ? (
          <EmptyState title="All caught up" description="There are no notes waiting for review." />
        ) : (
          <>
            <ul className="space-y-4">
              {notes.map((note) => {
                const category = refName(note.categoryId)
                const uploader = refName(note.uploaderId)
                const previewing = previewId === note._id

                return (
                  <li key={note._id} className="glass min-w-0 rounded-[1.75rem] p-5 sm:p-6">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xs font-bold text-brand">
                        PDF
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="break-words text-lg font-semibold tracking-tight">
                          {note.title}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {[
                            uploader && `By ${uploader}`,
                            category,
                            formatDate(note.createdAt),
                            note.file ? formatSize(note.file.sizeBytes) : ""
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-sm">
                          {note.description}
                        </p>

                        {(note.subject || note.tags.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {note.subject && (
                              <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                {note.subject}
                              </span>
                            )}
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium dark:border-white/20"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-300/40 pt-4 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => togglePreview(note._id)}
                        disabled={!note.file}
                        aria-expanded={previewing}
                        className={outlineButton}
                      >
                        {previewing ? "Hide preview" : "Preview PDF"}
                      </button>

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMessage(null)
                            setRejecting(note)
                          }}
                          disabled={busyId === note._id}
                          className="rounded-full px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(note)}
                          disabled={busyId === note._id}
                          className="btn-primary px-5! py-2! text-sm"
                        >
                          {busyId === note._id ? "Working..." : "Approve"}
                        </button>
                      </div>
                    </div>

                    {previewing && (
                      <div
                        id={`preview-${note._id}`}
                        className="mt-4 min-w-0 scroll-mt-28 rounded-2xl bg-white/40 p-3 sm:p-4 dark:bg-white/5"
                      >
                        <PdfViewer key={note._id} noteId={note._id} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </section>

      {rejecting && (
        <RejectDialog
          note={rejecting}
          loading={rejectLoading}
          error={rejectError}
          onSubmit={handleReject}
          onCancel={closeReject}
        />
      )}
    </div>
  )
}