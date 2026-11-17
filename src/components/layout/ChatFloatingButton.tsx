
import { useNavigate } from "react-router-dom"

export default function ChatFloatingButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate("/chat")}
      aria-label="Open StudyHub messages"
      title="Messages"
      className="
        fixed bottom-28 left-4 z-50
        md:bottom-6 md:left-6
        flex h-[60px] w-[60px]
        items-center justify-center
        rounded-full text-white
        shadow-[inset_0_1px_2px_rgb(255_255_255/0.5),0_10px_30px_rgb(10_132_255/0.4)]
        transition-all duration-300
        hover:-translate-y-1 hover:scale-105
        active:scale-95
        focus-visible:outline-2
        focus-visible:outline-offset-4
        focus-visible:outline-[#0a84ff]
      "
      style={{
        background: "linear-gradient(135deg, #1d5fe0 0%, #1fb5f2 100%)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>

      <span
        className="
          absolute right-0 top-0
          h-[17px] w-[17px]
          rounded-full border-[3px]
          border-white bg-[#19d5ed]
        "
        aria-hidden="true"
      />
    </button>
  )
}
