
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import Pagination from "../components/common/Pagination"
import NoteCard from "../components/note/NoteCard"
import { getErrorMessage } from "../service/api"
import { getPublicProfile } from "../service/user"
import type { PublicProfileResponse } from "../types"

const PAGE_SIZE = 12

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!userId) {
      setError("Invalid user profile.")
      setLoading(false)
      return
    }

    let cancelled = false

    const loadProfile = async () => {
      setLoading(true)
      setError("")

      try {
        const data = await getPublicProfile(userId, page, PAGE_SIZE)

        if (!cancelled) {
          setProfile(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load this profile."))
          setProfile(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [userId, page])

  if (loading && !profile) {
    return <LoadingSpinner label="Loading user profile" />
  }

  if (error && !profile) {
    return (
      <div className="glass rounded-[2rem] px-6 py-10 text-center">
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>

        <Link
          to="/browse"
          className="mt-5 inline-flex font-semibold text-brand hover:underline"
        >
          Browse notes
        </Link>
      </div>
    )
  }

  if (!profile) return null

  const { user, notes } = profile

  const displayRole = user.roles.includes("ADMIN")
    ? "Administrator"
    : "Student"

  return (
    <div className="space-y-8">
      <section className="glass rounded-[2rem] px-6 py-10 text-center sm:px-10">
        <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-white/80 bg-brand/10 shadow-xl dark:border-white/15 sm:h-36 sm:w-36">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-brand">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          {user.name}
        </h1>

        <span className="mt-3 inline-flex rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand">
          {displayRole}
        </span>
      </section>

      <section aria-labelledby="shared-notes-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="shared-notes-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Shared Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {notes.total} {notes.total === 1 ? "note" : "notes"} shared
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="glass h-64 animate-pulse rounded-[1.75rem]"
              />
            ))}
          </div>
        ) : notes.items.length === 0 ? (
          <EmptyState
            title="No notes shared yet"
            description="This user hasn't shared any approved notes."
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {notes.items.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>

            <Pagination
              page={notes.page}
              totalPages={notes.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  )
}
