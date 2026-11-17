
import { Link } from "react-router-dom"
import type { Note } from "../../types"
import { useAuth } from "../../hooks/useAuth"
import { formatDate, formatSize, refName } from "../../utils/format"
import StatusBadge from "../common/StatusBadge"

interface NoteCardProps {
  note: Note
  showStatus?: boolean
}

export default function NoteCard({ note, showStatus = false }: NoteCardProps) {
  const { user: currentUser } = useAuth()

  const category = refName(note.categoryId)
  const uploader = refName(note.uploaderId)

  const uploaderId =
    typeof note.uploaderId === "object"
      ? note.uploaderId?._id
      : note.uploaderId

  const uploaderAvatar =
    typeof note.uploaderId === "object"
      ? note.uploaderId.avatarUrl
      : null

  const profileLink =
    currentUser?.id === uploaderId
      ? "/profile"
      : `/users/${uploaderId}`

  return (
    <div className="glass group relative flex h-full flex-col rounded-[1.75rem] p-5 transition duration-200 hover:-translate-y-1">

      <Link
        to={`/notes/${note._id}`}
        aria-label={`View note: ${note.title}`}
        className="absolute inset-0 z-0 rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">

        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-xs font-bold text-brand">
            PDF
          </div>

          {showStatus && <StatusBadge status={note.status} />}
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
          {note.title}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {[note.subject, category].filter(Boolean).join(" · ")}
        </p>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-300">
          {note.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-300/40 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">

          <div className="flex min-w-0 items-center gap-2">

            {uploaderId ? (
              <Link
                to={profileLink}
                aria-label={`View ${uploader}'s profile`}
                className="group/uploader pointer-events-auto relative z-20 flex min-w-0 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/70 bg-brand/10 transition-transform duration-200 group-hover/uploader:scale-110 dark:border-white/10">
                  {uploaderAvatar ? (
                    <img
                      src={uploaderAvatar}
                      alt={uploader}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-semibold text-brand">
                      {uploader?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <span className="truncate transition-colors duration-200 group-hover/uploader:text-brand">
                  {uploader}
                </span>
              </Link>
            ) : (
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/70 bg-brand/10 font-semibold text-brand dark:border-white/10">
                  {uploader?.charAt(0).toUpperCase() || "U"}
                </div>

                <span className="truncate">{uploader}</span>
              </div>
            )}

            <span className="shrink-0">
              {formatDate(note.createdAt)}
            </span>
          </div>

          <span className="shrink-0">
            {note.file ? `${formatSize(note.file.sizeBytes)} · ` : ""}
            {note.downloadCount} downloads
          </span>

        </div>
      </div>
    </div>
  )
}
