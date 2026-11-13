import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import ConfirmDialog from "../components/common/ConfirmDialog"
import EmptyState from "../components/common/EmptyState"
import LoadingSpinner from "../components/common/LoadingSpinner"
import StatusBadge from "../components/common/StatusBadge"
import { getErrorMessage } from "../service/api"
import { deleteNote, getDownloadUrl, getMyNotes } from "../service/note"
import type { Note, NoteStatus } from "../types"
import { formatDate, formatSize, refName } from "../utils/format"

type Filter = "ALL" | NoteStatus

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" }
]

const outlineButton =
  "rounded-full border border-slate-300 bg-white/50 px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand disabled:opacity-50 dark:border-white/20 dark:bg-white/10"

export default function MyNotesPage() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [filter, setFilter] = useState<Filter>("ALL")

  const [toDelete, setToDelete] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getMyNotes()
      .then((data) => {
        if (!cancelled) setNotes(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleDownload = async (note: Note) => {
    setBusyId(note._id)
    setActionError(null)

    try {
      const url = await getDownloadUrl(note._id)
      window.location.href = url
    } catch (error) {
      setActionError(getErrorMessage(error, "Could not download this file"))
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteNote(toDelete._id)
      setNotes((current) => current?.filter((note) => note._id !== toDelete._id) ?? current)
      setToDelete(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Could not delete this note"))
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  if (loadError) {
    return (
      <p
        role="alert"
        className="glass mx-auto max-w-lg rounded-[2rem] px-6 py-8 text-center text-slate-500 dark:text-slate-400"
      >
        Could not load your notes right now. Please try again in a moment.
      </p>
    )
  }

  if (!notes) {
    return <LoadingSpinner label="Loading your notes" />
  }

  const counts = {
    ALL: notes.length,
    PENDING: notes.filter((n) => n.status === "PENDING").length,
    APPROVED: notes.filter((n) => n.status === "APPROVED").length,
    REJECTED: notes.filter((n) => n.status === "REJECTED").length
  }

  const visible = filter === "ALL" ? notes : notes.filter((note) => note.status === filter)

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">My notes</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Everything you have shared, and where it stands in review.
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          Upload a note
        </Link>
      </header>

      {notes.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="You haven't uploaded anything yet"
            description="Share your first note and help other students learn."
          />
          <div className="mt-6 text-center">
            <Link to="/upload" className="btn-primary">
              Upload a note
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
            {filters.map((item) => {
              const active = filter === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand text-white shadow-lg shadow-brand/30"
                      : "glass hover:text-brand"
                  }`}
                >
                  {item.label} <span className="opacity-70">{counts[item.value]}</span>
                </button>
              )
            })}
          </div>

          {actionError && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {actionError}
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {visible.length === 0 && (
              <li className="glass rounded-[2rem] px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                No notes with this status.
              </li>
            )}

            {visible.map((note) => {
              const category = refName(note.categoryId)
              return (
                <li key={note._id} className="glass rounded-[1.75rem] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xs font-bold text-brand">
                        PDF
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h2 className="min-w-0 break-words text-lg font-semibold tracking-tight sm:truncate">
                            {note.title}
                          </h2>
                          <StatusBadge status={note.status} />
                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {[
                            category,
                            formatDate(note.createdAt),
                            note.file ? formatSize(note.file.sizeBytes) : "",
                            note.status === "APPROVED" ? `${note.downloadCount} downloads` : ""
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {note.status === "PENDING" && (
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Waiting for a moderator to review this note.
                          </p>
                        )}

                        {note.status === "REJECTED" && (
                          <p className="mt-3 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                            <span className="font-semibold">Rejected:</span>{" "}
                            {note.rejectionReason || "No reason was given."}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                      {note.status === "APPROVED" && (
                        <Link to={`/notes/${note._id}`} className={outlineButton}>
                          View
                        </Link>
                      )}
                      {note.file && (
                        <button
                          type="button"
                          onClick={() => handleDownload(note)}
                          disabled={busyId === note._id}
                          className={outlineButton}
                        >
                          {busyId === note._id ? "Preparing..." : "Download"}
                        </button>
                      )}
                      <Link to={`/my-notes/${note._id}/edit`} className={outlineButton}>
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(note)}
                        className="rounded-full px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this note?"
        message={`“${toDelete?.title ?? ""}” and its PDF file will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete note"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}