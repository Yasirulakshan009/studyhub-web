
import { Link } from "react-router-dom"

export default function ChatPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="glass rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Messages
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Stay connected with your study community.
            </p>
          </div>
        </div>
      </section>

      <section className="glass min-h-[420px] rounded-[2rem] p-6 sm:p-10">
        <div className="flex min-h-[370px] flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand shadow-inner">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z" />
              <path d="M8 12h.01M12 12h.01M16 12h.01" />
            </svg>
          </div>

          <h2 className="mt-6 text-xl font-bold tracking-tight">
            No conversations yet!
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Looking to connect with other students?
            Visit a user's profile and click the Message button
            to start a private conversation.
          </p>

          <Link
            to="/browse"
            className="btn-primary mt-7 inline-flex items-center gap-2"
          >
            <span>Explore StudyHub</span>
            <span aria-hidden="true">→</span>
          </Link>

          <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
            Share knowledge. Ask questions. Learn together.
          </p>
        </div>
      </section>
    </div>
  )
}
