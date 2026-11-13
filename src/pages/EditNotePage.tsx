import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import Dropdown from "../components/common/Dropdown"
import LoadingSpinner from "../components/common/LoadingSpinner"
import InputField from "../components/forms/InputField"
import TextAreaField from "../components/forms/TextAreaField"
import { useAuth } from "../hooks/useAuth"
import { getErrorMessage } from "../service/api"
import { getCategories, getCategoryById } from "../service/category"
import { getMyNotes, updateNote } from "../service/note"
import type { Category, Note } from "../types"

type LoadState = "loading" | "ready" | "notfound" | "error"

interface FormErrors {
  title?: string
  description?: string
  category?: string
  subject?: string
  tags?: string
}

export default function EditNotePage() {
  const { id = "" } = useParams()
  const { isAdmin } = useAuth()

  const [loadState, setLoadState] = useState<LoadState>("loading")
  const [note, setNote] = useState<Note | null>(null)
  const [mains, setMains] = useState<Category[]>([])
  const [subs, setSubs] = useState<Category[]>([])
  const subRequest = useRef(0)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mainId, setMainId] = useState("")
  const [subId, setSubId] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState("")

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [notes, mainList] = await Promise.all([getMyNotes(), getCategories()])
        const found = notes.find((item) => item._id === id)

        if (!found) {
          if (!cancelled) setLoadState("notfound")
          return
        }

        const categoryId =
          typeof found.categoryId === "object" ? found.categoryId._id : found.categoryId

        let main = categoryId
        let sub = ""
        let subList: Category[] = []

        try {
          const category = await getCategoryById(categoryId)
          if (category.parentId) {
            main = category.parentId
            sub = category._id
          }
          subList = await getCategories(main)
        } catch {
          subList = []
        }

        if (cancelled) return

        setNote(found)
        setMains(mainList)
        setSubs(subList)
        setTitle(found.title)
        setDescription(found.description)
        setMainId(main)
        setSubId(sub)
        setSubject(found.subject ?? "")
        setTags(found.tags.join(", "))
        setLoadState("ready")
      } catch {
        if (!cancelled) setLoadState("error")
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleMainChange = (value: string) => {
    setMainId(value)
    setSubId("")
    setSubs([])
    setErrors((current) => ({ ...current, category: undefined }))

    if (!value) return

    const requestId = ++subRequest.current
    getCategories(value)
      .then((data) => {
        if (requestId === subRequest.current) setSubs(data)
      })
      .catch(() => {
        if (requestId === subRequest.current) setSubs([])
      })
  }

  const validate = () => {
    const found: FormErrors = {}

    const cleanTitle = title.trim()
    if (cleanTitle.length < 5 || cleanTitle.length > 120) {
      found.title = "Title must be 5 to 120 characters"
    }

    if (!description.trim()) {
      found.description = "Description is required"
    } else if (description.trim().length > 2000) {
      found.description = "Description must be 2000 characters or less"
    }

    if (!mainId) {
      found.category = "Please choose a category"
    }

    if (subject.trim().length > 100) {
      found.subject = "Subject must be 100 characters or less"
    }

    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean)
    if (tagList.length > 10) {
      found.tags = "Use at most 10 tags"
    } else if (tagList.some((t) => t.length > 30)) {
      found.tags = "Each tag must be 30 characters or less"
    }

    return found
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      await updateNote(id, {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        categoryId: subId || mainId
      })
      setSaved(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not save your changes. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadState === "loading") {
    return <LoadingSpinner label="Loading note" />
  }

  if (loadState !== "ready" || !note) {
    return (
      <div className="glass mx-auto max-w-lg rounded-[2rem] px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {loadState === "notfound" ? "Note not found" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {loadState === "notfound"
            ? "This note does not exist, or it does not belong to you."
            : "We could not load this note. Please try again in a moment."}
        </p>
        <Link to="/my-notes" className="btn-primary mt-6">
          Back to my notes
        </Link>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600 dark:text-emerald-300">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Changes saved</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Your changes are live."
              : "Your note has been sent for review again. It will appear in Browse once a moderator approves it."}
          </p>
          <Link to="/my-notes" className="btn-primary mt-8">
            Back to my notes
          </Link>
        </div>
      </div>
    )
  }

  const mainOptions = [
    { value: "", label: "Select a category" },
    ...mains.map((category) => ({ value: category._id, label: category.name }))
  ]

  const subOptions = [
    { value: "", label: "General (no sub-category)" },
    ...subs.map((sub) => ({ value: sub._id, label: sub.name }))
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/my-notes"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
      >
        <span aria-hidden="true">←</span> Back to my notes
      </Link>

      <header className="pt-4">
        <h1 className="text-4xl font-semibold tracking-tight">Edit note</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Update the details of your note. The PDF itself cannot be changed. To replace the file,
          delete this note and upload it again.
        </p>
      </header>

      {!isAdmin && note.status === "APPROVED" && (
        <p
          role="note"
          className="mt-5 rounded-2xl bg-amber-500/15 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          This note is live. Saving changes will send it back for review, and it will be hidden from
          Browse until a moderator approves it again.
        </p>
      )}

      {!isAdmin && note.status === "REJECTED" && (
        <p
          role="note"
          className="mt-5 rounded-2xl bg-brand/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
        >
          <span className="font-semibold">Rejected:</span>{" "}
          {note.rejectionReason || "No reason was given."} Fix the issues and save to submit it for
          review again.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="glass mt-6 space-y-5 rounded-[2rem] p-6 sm:p-8"
      >
        <InputField
          label="Title"
          id="title"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <TextAreaField
          label="Description"
          id="description"
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Category
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              label="Category"
              value={mainId}
              options={mainOptions}
              onChange={handleMainChange}
            />
            {subs.length > 0 && (
              <Dropdown
                label="Sub-category"
                value={subId}
                options={subOptions}
                onChange={setSubId}
              />
            )}
          </div>
          {errors.category && (
            <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.category}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Subject (optional)"
            id="subject"
            maxLength={100}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
          />
          <InputField
            label="Tags (optional)"
            id="tags"
            placeholder="sql, 3nf, exam"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            error={errors.tags}
          />
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            to="/my-notes"
            className="rounded-full border border-slate-300 bg-white/50 px-6 py-2.5 text-center text-sm font-semibold transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}