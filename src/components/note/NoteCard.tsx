import { Link } from "react-router-dom"
import type { Note } from "../../types"
import { formatDate, formatSize, refName } from "../../utils/format"
import StatusBadge from "../common/StatusBadge"

interface NoteCardProps {
  note: Note
  showStatus?: boolean
}

export default function NoteCard({ note, showStatus = false }: NoteCardProps) {
  const category = refName(note.categoryId)
  const uploader = refName(note.uploaderId)

  return (
    <Link
      to={`/notes/${note._id}`}
      className="glass group flex h-full flex-col rounded-[1.75rem] p-5 transition duration-200 hover:-translate-y-1"
    >
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

      <div className="mt-4 flex items-center justify-between border-t border-slate-300/40 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
        <span>{[uploader, formatDate(note.createdAt)].filter(Boolean).join(" · ")}</span>
        <span>
          {note.file ? `${formatSize(note.file.sizeBytes)} · ` : ""}
          {note.downloadCount} downloads
        </span>
      </div>
    </Link>
  )
}