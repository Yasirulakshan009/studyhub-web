import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import Dropdown from "../components/common/Dropdown"
import FileField from "../components/forms/FileField"
import InputField from "../components/forms/InputField"
import TextAreaField from "../components/forms/TextAreaField"
import { getErrorMessage } from "../service/api"
import { getCategories } from "../service/category"
import { uploadNote } from "../service/note"
import type { Category } from "../types"

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface FormErrors {
  title?: string
  description?: string
  category?: string
  subject?: string
  tags?: string
  file?: string
  confirm?: string
}

export default function UploadPage() {
  const [mains, setMains] = useState<Category[]>([])
  const [subs, setSubs] = useState<Category[]>([])
  const subRequest = useRef(0)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [mainId, setMainId] = useState("")
  const [subId, setSubId] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((data) => {
        if (!cancelled) setMains(data)
      })
      .catch(() => {
        if (!cancelled) setMains([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleMainChange = (value: string) => {
    setMainId(value)
    setSubId("")
    setSubs([])
    setErrors((current) => ({ ...current, category: undefined }))

    if (!value) return

    const id = ++subRequest.current
    getCategories(value)
      .then((data) => {
        if (id === subRequest.current) setSubs(data)
      })
      .catch(() => {
        if (id === subRequest.current) setSubs([])
      })
  }

  const handleFileChange = (picked: File | null) => {
    setFile(picked)
    setErrors((current) => ({ ...current, file: undefined }))
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setMainId("")
    setSubId("")
    setSubs([])
    setSubject("")
    setTags("")
    setFile(null)
    setConfirmed(false)
    setErrors({})
    setServerError(null)
    setSubmittedTitle(null)
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

    if (!file) {
      found.file = "Please choose a PDF file"
    } else if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      found.file = "Only PDF files are allowed"
    } else if (file.size > MAX_FILE_SIZE) {
      found.file = "File is too large. Maximum size is 10 MB"
    }

    if (!confirmed) {
      found.confirm = "You must confirm that you own this note or have permission to share it"
    }

    return found
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0 || !file) {
      return
    }

    setSubmitting(true)
    try {
      const note = await uploadNote({
        title: title.trim(),
        description: description.trim(),
        categoryId: subId || mainId,
        subject: subject.trim() || undefined,
        tags: tags.trim() || undefined,
        ownershipConfirmed: confirmed,
        file
      })
      setSubmittedTitle(note.title)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      setServerError(getErrorMessage(error, "Upload failed. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  const mainOptions = [
    { value: "", label: "Select a category" },
    ...mains.map((category) => ({ value: category._id, label: category.name }))
  ]

  const subOptions = [
    { value: "", label: "General (no sub-category)" },
    ...subs.map((sub) => ({ value: sub._id, label: sub.name }))
  ]

  if (submittedTitle) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600 dark:text-emerald-300">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Submitted for review</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            “{submittedTitle}” is now pending. It will appear in Browse once a moderator approves it.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={resetForm} className="btn-primary">
              Upload another note
            </button>
            <Link
              to="/browse"
              className="rounded-full border border-slate-300 bg-white/50 px-6 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"
            >
              Browse notes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="pt-2">
        <h1 className="text-4xl font-semibold tracking-tight">Upload a note</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Share a PDF with other students. Every upload is reviewed before it goes public.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="glass mt-6 space-y-5 rounded-[2rem] p-6 sm:p-8">
        <InputField
          label="Title"
          id="title"
          placeholder="e.g. Database normalization notes"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <TextAreaField
          label="Description"
          id="description"
          placeholder="What does this note cover? Mention the topics, semester or exam it helps with."
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
            placeholder="e.g. Normalization"
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

        <FileField
          label="PDF file"
          id="file"
          file={file}
          onChange={handleFileChange}
          error={errors.file}
          hint="PDF only, up to 10 MB"
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked)
                setErrors((current) => ({ ...current, confirm: undefined }))
              }}
              aria-invalid={errors.confirm ? true : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#0a84ff]"
            />
            <span>
              I confirm that this note is my own work, or I have permission to share it.
            </span>
          </label>
          {errors.confirm && (
            <p role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {errors.confirm}
            </p>
          )}
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Uploading..." : "Submit for review"}
        </button>
      </form>
    </div>
  )
}