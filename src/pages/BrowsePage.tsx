import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import Dropdown from "../components/common/Dropdown"
import EmptyState from "../components/common/EmptyState"
import Pagination from "../components/common/Pagination"
import NoteCard from "../components/note/NoteCard"
import { getCategories, getCategoryById } from "../service/category"
import { getNotes, type NoteSort } from "../service/note"
import type { Category, Note, Paginated } from "../types"

const SORTS: NoteSort[] = ["newest", "oldest", "mostDownloaded", "relevance"]
const PAGE_SIZE = 12

const sortLabels: Record<NoteSort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  mostDownloaded: "Most downloaded",
  relevance: "Best match"
}

interface SearchBarProps {
  initial: string
  onSearch: (q: string) => void
}

function SearchBar({ initial, onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initial)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="glass mt-6 flex max-w-2xl items-center gap-2 rounded-full p-2 pl-6"
    >
      <label htmlFor="browse-search" className="sr-only">
        Search notes
      </label>
      <input
        id="browse-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search notes by title, subject or keyword..."
        className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-slate-400"
      />
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 py-1.5 pl-4 pr-2 text-sm font-medium text-brand">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs transition hover:bg-brand/20"
      >
        ✕
      </button>
    </span>
  )
}

interface Result {
  key: string
  data: Paginated<Note> | null
  error: boolean
}

interface CategoryInfo {
  id: string
  current: Category
  subs: Category[]
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get("q") ?? ""
  const categoryId = searchParams.get("categoryId") ?? ""
  const sortParam = searchParams.get("sort") ?? ""
  const validSort = SORTS.includes(sortParam as NoteSort) ? (sortParam as NoteSort) : undefined
  const sort = validSort === "relevance" && !q ? undefined : validSort
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)

  const key = `${q}|${categoryId}|${sort ?? ""}|${page}`
  const [result, setResult] = useState<Result | null>(null)

  const [mains, setMains] = useState<Category[]>([])
  const [catInfo, setCatInfo] = useState<CategoryInfo | null>(null)

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

  useEffect(() => {
    if (!categoryId) return

    let cancelled = false

    getCategoryById(categoryId)
      .then(async (current) => {
        const subs = await getCategories(current.parentId ?? current._id)
        if (!cancelled) setCatInfo({ id: categoryId, current, subs })
      })
      .catch(() => {
        if (!cancelled) setCatInfo(null)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  useEffect(() => {
    let cancelled = false

    getNotes({
      q: q || undefined,
      categoryId: categoryId || undefined,
      sort,
      page,
      limit: PAGE_SIZE
    })
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ key, data: null, error: true })
      })

    return () => {
      cancelled = true
    }
  }, [key, q, categoryId, sort, page])

  const info = categoryId && catInfo?.id === categoryId ? catInfo : null
  const mainId = info ? (info.current.parentId ?? info.current._id) : ""
  const subId = info && info.current.parentId ? info.current._id : ""
  const defaultSort: NoteSort = q ? "relevance" : "newest"

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...mains.map((category) => ({ value: category._id, label: category.name }))
  ]

  const subOptions = info
    ? [
        { value: mainId, label: "All sub-categories" },
        ...info.subs.map((sub) => ({ value: sub._id, label: sub.name }))
      ]
    : []

  const sortOptions = SORTS.filter((option) => option !== "relevance" || q).map((option) => ({
    value: option,
    label: sortLabels[option]
  }))

  const loading = result?.key !== key
  const notes = result?.data?.items ?? []
  const total = result?.data?.total ?? 0
  const totalPages = result?.data?.totalPages ?? 1
  const hasFilters = Boolean(q || categoryId || sort)

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([name, value]) => {
      if (value) {
        next.set(name, value)
      } else {
        next.delete(name)
      }
    })
    setSearchParams(next)
  }

  const handleSearch = (value: string) => {
    updateParams({ q: value || undefined, page: undefined })
  }

  const handleCategory = (value: string) => {
    updateParams({ categoryId: value || undefined, page: undefined })
  }

  const handleSort = (value: string) => {
    updateParams({ sort: value === defaultSort ? undefined : value, page: undefined })
  }

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : undefined })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => setSearchParams({})

  return (
    <div>
      <header className="pt-2">
        <h1 className="text-4xl font-semibold tracking-tight">Browse notes</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {loading || result?.error
            ? "Search lecture notes and past papers shared by students."
            : `${total} ${total === 1 ? "note" : "notes"} found${q ? ` for “${q}”` : ""}`}
        </p>

        <SearchBar key={q} initial={q} onSearch={handleSearch} />
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Dropdown
          label="Category"
          value={mainId}
          options={categoryOptions}
          onChange={handleCategory}
        />

        {subOptions.length > 1 && (
          <Dropdown
            label="Sub-category"
            value={subId || mainId}
            options={subOptions}
            onChange={handleCategory}
          />
        )}

        <div className="ml-auto">
          <Dropdown
            label="Sort by"
            value={sort ?? defaultSort}
            options={sortOptions}
            onChange={handleSort}
            align="right"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {q && (
            <FilterChip
              label={`“${q}”`}
              onRemove={() => updateParams({ q: undefined, page: undefined })}
            />
          )}
          {categoryId && (
            <FilterChip
              label={info?.current.name ?? "Category"}
              onRemove={() => updateParams({ categoryId: undefined, page: undefined })}
            />
          )}
          {sort && (
            <FilterChip
              label={sortLabels[sort]}
              onRemove={() => updateParams({ sort: undefined, page: undefined })}
            />
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="px-2 text-sm font-medium text-slate-500 transition hover:text-brand dark:text-slate-400"
          >
            Clear all
          </button>
        </div>
      )}

      <section className="mt-8" aria-live="polite">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-64 animate-pulse rounded-[1.75rem]" />
            ))}
          </div>
        ) : result?.error ? (
          <p
            role="alert"
            className="glass rounded-[2rem] px-6 py-8 text-center text-slate-500 dark:text-slate-400"
          >
            Could not load notes right now. Please try again in a moment.
          </p>
        ) : notes.length === 0 ? (
          <EmptyState
            title="No notes found"
            description={
              hasFilters
                ? "Try a different keyword or clear your filters."
                : "Nothing has been approved yet. Be the first to share a note."
            }
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          </>
        )}
      </section>
    </div>
  )
}