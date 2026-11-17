
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import Pagination from "../components/common/Pagination"
import NoteCard from "../components/note/NoteCard"
import api, { getErrorMessage } from "../service/api"
import { getPublicProfile } from "../service/user"
import { useAuth } from "../hooks/useAuth"
import type { PublicProfileResponse } from "../types"

const PAGE_SIZE = 12

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [startingChat, setStartingChat] = useState(false)

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

  const handleStartChat = async () => {
    if (!user?.id || startingChat) return

    try {
      setStartingChat(true)
      setError("")

      const response = await api.post("/chat/conversations", {
        otherUserId: user.id,
      })

      const conversationId = response.data.data._id

      navigate("/chat", {
        state: { conversationId },
      })
    } catch (err) {
      setError(getErrorMessage(err, "Could not start conversation."))
    } finally {
      setStartingChat(false)
    }
  }

  const handleNoteLikeChange = (
    noteId: string,
    isLiked: boolean,
    totalLikes: number
  ) => {
    setProfile((current) => {
      if (!current) return current

      const previousNote = current.notes.items.find(
        (note) => note._id === noteId
      )

      const previousLikes = previousNote?.totalLikes ?? 0
      const difference = totalLikes - previousLikes

      return {
        ...current,
        user: {
          ...current.user,
          totalLikes: Math.max(0, current.user.totalLikes + difference)
        },
        notes: {
          ...current.notes,
          items: current.notes.items.map((note) =>
            note._id === noteId
              ? { ...note, isLiked, totalLikes }
              : note
          )
        }
      }
    })
  }

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

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand">
            {displayRole}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {user.totalLikes} Likes
          </span>
        </div>

        {currentUser && currentUser.id !== user.id && (
          <button
            type="button"
            onClick={handleStartChat}
            disabled={startingChat}
            className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-50"
          >
            <span>💬</span>
            {startingChat ? "Opening chat..." : "Message"}
          </button>
        )}
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
                <NoteCard
                  key={note._id}
                  note={note}
                  onLikeChange={handleNoteLikeChange}
                />
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
