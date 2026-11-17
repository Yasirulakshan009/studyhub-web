import { useRef, useState, type ChangeEvent } from "react"
import { getErrorMessage } from "../../service/api"
import { removeAvatar, uploadAvatar } from "../../service/auth"
import type { User } from "../../types"

const MAX_SIZE = 2 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

interface AvatarEditorProps {
  user: User
  onChange: (user: User) => void
}

export default function AvatarEditor({ user, onChange }: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (!TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.")
      return
    }
    if (file.size > MAX_SIZE) {
      setError("The image is too large. Maximum size is 2 MB.")
      return
    }

    setBusy(true)
    setError(null)

    try {
      onChange(await uploadAvatar(file))
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload the photo."))
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    setBusy(true)
    setError(null)

    try {
      onChange(await removeAvatar())
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove the photo."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-white/90 via-sky-100/70 to-sky-300/50 text-3xl font-semibold text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-12px_18px_rgb(10_132_255/0.14),0_12px_28px_rgb(10_132_255/0.3)] dark:border-white/25 dark:from-white/30 dark:via-sky-300/15 dark:to-sky-500/30 dark:text-white">
        {user.avatarUrl ? (
          <img
          src={user.avatarUrl}
          alt={`${user.name}'s profile photo`}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-1 h-7 rounded-full bg-gradient-to-b from-white/90 to-white/0 dark:from-white/40"
            />
            <span className="relative">{getInitials(user.name)}</span>
          </>
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
            <span
              role="status"
              aria-label="Uploading"
              className="h-6 w-6 animate-spin rounded-full border-4 border-brand border-t-transparent"
            />
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-slate-300 bg-white/50 px-4 py-1.5 text-xs font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50 dark:border-white/20 dark:bg-white/10"
        >
          {user.avatarUrl ? "Change photo" : "Upload photo"}
        </button>
        {user.avatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="max-w-[16rem] text-center text-xs text-red-600 dark:text-red-400 sm:text-left">
          {error}
        </p>
      )}
    </div>
  )
}