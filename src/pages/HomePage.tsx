import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getCategories } from "../service/category"
import type { Category } from "../types"

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [selected, setSelected] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSelect = (category: Category) => {
    if (selected?._id === category._id) {
      setSelected(null)
      return
    }

    setSelected(category)
    setSubCategories([])
    setLoadingSubs(true)

    const id = ++requestId.current
    getCategories(category._id)
      .then((data) => {
        if (id === requestId.current) setSubCategories(data)
      })
      .catch(() => {
        if (id === requestId.current) setSubCategories([])
      })
      .finally(() => {
        if (id === requestId.current) setLoadingSubs(false)
      })
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse")
  }

  return (
    <div className="space-y-8">
      <section className="pb-0 pt-10 text-center md:pt-16">
        <p className="inline-flex rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
          Free student note library
        </p>

        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Learn together. <span className="text-brand">Share what helps.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400">
          Find lecture notes and past papers shared by students, organised by subject and reviewed
          before they go live.
        </p>

        <form
          onSubmit={handleSearch}
          role="search"
          className="glass mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full p-2 pl-6"
        >
          <label htmlFor="home-search" className="sr-only">
            Search notes
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by title, subject or keyword..."
            className="min-w-0 flex-1 bg-transparent py-2 outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link to="/browse" className="font-medium text-brand hover:underline">
            Browse all notes
          </Link>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
            •
          </span>
          <Link to="/upload" className="font-medium text-brand hover:underline">
            Share your notes
          </Link>
        </div>
      </section>

      {(loadingCategories || categories.length > 0) && (
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-2xl font-semibold tracking-tight">
            Browse by category
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Pick a subject area to see its sub-topics.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {loadingCategories
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass h-11 w-36 animate-pulse rounded-full"
                    aria-hidden="true"
                  />
                ))
              : categories.map((category) => {
                  const active = selected?._id === category._id
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => handleSelect(category)}
                      aria-expanded={active}
                      className={`rounded-full px-5 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                        active
                          ? "bg-brand text-white shadow-lg shadow-brand/30"
                          : "glass hover:text-brand"
                      }`}
                    >
                      {category.name}
                    </button>
                  )
                })}
          </div>

          {selected && (
            <div className="glass mt-4 rounded-[2rem] p-6">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {selected.name}
              </p>

              {loadingSubs ? (
                <div className="mt-4 flex gap-3" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 w-28 animate-pulse rounded-full bg-slate-300/40" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/browse?categoryId=${selected._id}`}
                    className="btn-primary px-5! py-2! text-sm"
                  >
                    All {selected.name}
                  </Link>

                  {subCategories.map((sub) => (
                    <Link
                      key={sub._id}
                      to={`/browse?categoryId=${sub._id}`}
                      className="rounded-full border border-slate-300 bg-white/50 px-5 py-2 text-sm font-medium transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"
                    >
                      {sub.name}
                    </Link>
                  ))}

                  {subCategories.length === 0 && (
                    <p className="self-center text-sm text-slate-500 dark:text-slate-400">
                      No sub-categories yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}