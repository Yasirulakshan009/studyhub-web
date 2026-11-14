import { useEffect, useState, type FormEvent } from "react"
import ConfirmDialog from "../components/common/ConfirmDialog"
import Dropdown from "../components/common/Dropdown"
import EmptyState from "../components/common/EmptyState"
import LoadingSpinner from "../components/common/LoadingSpinner"
import InputField from "../components/forms/InputField"
import TextAreaField from "../components/forms/TextAreaField"
import { getErrorMessage } from "../service/api"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "../service/category"
import type { Category } from "../types"

interface Group {
  main: Category
  subs: Category[]
}

type DialogState =
  | { mode: "create"; parentId: string }
  | { mode: "edit"; category: Category }

const outlineButton =
  "rounded-full border border-slate-300 bg-white/50 px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"

const dangerButton =
  "rounded-full px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"

interface CategoryDialogProps {
  state: DialogState
  mains: Category[]
  onClose: () => void
  onSaved: (message: string) => void
}

function CategoryDialog({ state, mains, onClose, onSaved }: CategoryDialogProps) {
  const [name, setName] = useState(state.mode === "edit" ? state.category.name : "")
  const [description, setDescription] = useState(
    state.mode === "edit" ? (state.category.description ?? "") : ""
  )
  const [parentId, setParentId] = useState(state.mode === "create" ? state.parentId : "")
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [saving, onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const clean = name.trim()
    const found: { name?: string; description?: string } = {}

    if (clean.length < 2 || clean.length > 50) {
      found.name = "Name must be 2 to 50 characters"
    }
    if (description.length > 300) {
      found.description = "Description must be 300 characters or less"
    }

    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      if (state.mode === "edit") {
        await updateCategory(state.category._id, { name: clean, description: description.trim() })
        onSaved(`Updated “${clean}”.`)
      } else {
        await createCategory({
          name: clean,
          description: description.trim() || undefined,
          parentId: parentId || null
        })
        onSaved(`Created “${clean}”.`)
      }
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not save this category"))
    } finally {
      setSaving(false)
    }
  }

  const parentOptions = [
    { value: "", label: "None (main category)" },
    ...mains.map((main) => ({ value: main._id, label: main.name }))
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
      onClick={() => {
        if (!saving) onClose()
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        onSubmit={handleSubmit}
        noValidate
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md space-y-5 rounded-[2rem] bg-white/90 p-7 dark:bg-slate-900/90"
      >
        <h2 id="category-dialog-title" className="text-xl font-semibold tracking-tight">
          {state.mode === "edit" ? "Edit category" : "New category"}
        </h2>

        {state.mode === "create" && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Parent category
            </span>
            <Dropdown
              label="Parent category"
              value={parentId}
              options={parentOptions}
              onChange={setParentId}
            />
          </div>
        )}

        <InputField
          label="Name"
          id="category-name"
          maxLength={50}
          placeholder="e.g. Databases"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <TextAreaField
          label="Description (optional)"
          id="category-description"
          rows={3}
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
        />

        {serverError && (
          <p
            role="alert"
            className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-slate-300 bg-white/50 px-5 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand disabled:opacity-50 dark:border-white/20 dark:bg-white/10"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : state.mode === "edit" ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getCategories()
      .then(async (mains) => {
        const subLists = await Promise.all(mains.map((main) => getCategories(main._id)))
        if (!cancelled) {
          setGroups(mains.map((main, index) => ({ main, subs: subLists[index] })))
          setLoadError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleSaved = (text: string) => {
    setDialog(null)
    setMessage(text)
    setReloadKey((current) => current + 1)
  }

  const confirmDelete = async () => {
    if (!toDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteCategory(toDelete._id)
      setMessage(`Deleted “${toDelete.name}”.`)
      setToDelete(null)
      setReloadKey((current) => current + 1)
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Could not delete this category"))
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setToDelete(null)
    setDeleteError(null)
  }

  const openCreate = (parentId: string) => {
    setMessage(null)
    setDialog({ mode: "create", parentId })
  }

  const openEdit = (category: Category) => {
    setMessage(null)
    setDialog({ mode: "edit", category })
  }

  if (loadError && !groups) {
    return (
      <p
        role="alert"
        className="glass rounded-[2rem] px-6 py-8 text-center text-slate-500 dark:text-slate-400"
      >
        Could not load categories right now. Please try again in a moment.
      </p>
    )
  }

  if (!groups) {
    return <LoadingSpinner label="Loading categories" />
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Organise notes into subject areas and sub-topics.
          </p>
        </div>
        <button type="button" onClick={() => openCreate("")} className="btn-primary">
          New category
        </button>
      </header>

      {message && (
        <p
          role="status"
          className="mt-5 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
        >
          {message}
        </p>
      )}

      {groups.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No categories yet"
            description="Create the first category so students can organise their notes."
            actionLabel="New category"
            onAction={() => openCreate("")}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {groups.map(({ main, subs }) => (
            <li key={main._id} className="glass min-w-0 rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-semibold tracking-tight">
                      {main.name}
                    </h2>
                    {main.isSystem && (
                      <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        System
                      </span>
                    )}
                  </div>
                  {main.description && (
                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                      {main.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => openCreate(main._id)} className={outlineButton}>
                    Add sub-category
                  </button>
                  {!main.isSystem && (
                    <>
                      <button type="button" onClick={() => openEdit(main)} className={outlineButton}>
                        Edit
                      </button>
                      <button type="button" onClick={() => setToDelete(main)} className={dangerButton}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-300/40 pt-4 dark:border-white/10">
                {subs.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No sub-categories yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {subs.map((sub) => (
                      <li
                        key={sub._id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/50 px-4 py-3 dark:bg-white/5"
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium">{sub.name}</p>
                          {sub.description && (
                            <p className="break-words text-xs text-slate-500 dark:text-slate-400">
                              {sub.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(sub)} className={outlineButton}>
                            Edit
                          </button>
                          <button type="button" onClick={() => setToDelete(sub)} className={dangerButton}>
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <CategoryDialog
          key={dialog.mode === "edit" ? dialog.category._id : `new-${dialog.parentId}`}
          state={dialog}
          mains={groups.map((group) => group.main)}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this category?"
        message={`“${toDelete?.name ?? ""}” will be removed. A category that still has sub-categories or notes cannot be deleted.`}
        confirmLabel="Delete category"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}