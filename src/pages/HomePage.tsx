import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse")
  }

  return (
    <div className="space-y-16">
      <section className="py-10 text-center md:py-16">
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
    </div>
  )
}