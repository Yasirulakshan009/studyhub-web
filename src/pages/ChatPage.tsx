
import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import api, { getErrorMessage } from "../service/api"
import { createChatSocket } from "../service/socket"
import { useAuth } from "../hooks/useAuth"
import type { Socket } from "socket.io-client"

interface ChatParticipant {
  _id: string
  name: string
  avatarUrl?: string | null
}

interface Conversation {
  _id: string
  participants: ChatParticipant[]
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}

interface ChatMessage {
  _id: string
  conversationId: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  readAt?: string | null
}

export default function ChatPage() {
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [messageError, setMessageError] = useState("")

  const socketRef = useRef<Socket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedId
  )

  const getOtherParticipant = (conversation: Conversation) =>
    conversation.participants.find(
      (participant) => participant._id !== user?.id
    )

  const fetchConversations = async () => {
    try {
      const response = await api.get("/chat/conversations")
      setConversations(response.data.data)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load conversations"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    const state = location.state as {
      conversationId?: string
    } | null
  
    if (state?.conversationId) {
      setSelectedId(state.conversationId)
  
      navigate(location.pathname, {
        replace: true,
        state: null,
      })
    }
  }, [location.state, location.pathname, navigate])

  useEffect(() => {
    if (!selectedId) {
      setMessages([])
      return
    }

    let active = true

    const loadMessages = async () => {
      try {
        setMessagesLoading(true)
        setMessageError("")

        const response = await api.get(
          `/chat/conversations/${selectedId}/messages`
        )

        if (!active) return

        setMessages(response.data.data.items)

        await api.patch(`/chat/conversations/${selectedId}/read`)

        if (active) {
          setConversations((current) =>
            current.map((conversation) =>
              conversation._id === selectedId
                ? { ...conversation, unreadCount: 0 }
                : conversation
            )
          )
        }
      } catch (err) {
        if (active) {
          setMessageError(
            getErrorMessage(err, "Failed to load messages")
          )
        }
      } finally {
        if (active) setMessagesLoading(false)
      }
    }

    loadMessages()

    return () => {
      active = false
    }
  }, [selectedId])

  useEffect(() => {
    if (!user?.id) return

    const socket = createChatSocket()
    if (!socket) return

    socketRef.current = socket

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId === selectedId) {
        setMessages((current) => {
          if (current.some((item) => item._id === message._id)) {
            return current
          }

          return [...current, message]
        })

        if (message.receiverId === user.id) {
          api.patch(
            `/chat/conversations/${message.conversationId}/read`
          ).then(() => {
            setConversations((current) =>
              current.map((conversation) =>
                conversation._id === message.conversationId
                  ? { ...conversation, unreadCount: 0 }
                  : conversation
              )
            )
          }).catch(() => {})
        }
      }

      fetchConversations()
    }

    const handleNotification = () => {
      fetchConversations()
    }

    const joinConversation = () => {
      if (selectedId) {
        socket.emit("conversation:join", selectedId)
      }
    }

    socket.on("message:new", handleNewMessage)
    socket.on("notification:new", handleNotification)
    socket.on("connect", joinConversation)

    if (socket.connected) {
      joinConversation()
    }

    return () => {
      socket.emit("conversation:leave", selectedId)
      socket.off("message:new", handleNewMessage)
      socket.off("notification:new", handleNotification)
      socket.off("connect", joinConversation)
      socket.disconnect()
      socketRef.current = null
    }
  }, [selectedId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = newMessage.trim()

    if (!text || !selectedId || sending) return

    try {
      setSending(true)
      setMessageError("")

      const response = await api.post(
        `/chat/conversations/${selectedId}/messages`,
        { text }
      )

      const message: ChatMessage = response.data.data

      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) {
          return current
        }

        return [...current, message]
      })

      setNewMessage("")
      fetchConversations()
    } catch (err) {
      setMessageError(
        getErrorMessage(err, "Failed to send message")
      )
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date?: string) => {
    if (!date) return ""

    const value = new Date(date)

    if (Number.isNaN(value.getTime())) return ""

    return value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date?: string) => {
    if (!date) return ""

    const value = new Date(date)

    if (Number.isNaN(value.getTime())) return ""

    return value.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="glass rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-2xl">
            💬
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

      <section className="glass flex min-h-[600px] overflow-hidden rounded-[2rem]">
        <aside
          className={`w-full shrink-0 border-r border-slate-200/60 dark:border-slate-700/60 md:w-[340px] ${
            selectedId ? "hidden md:block" : "block"
          }`}
        >
          <div className="border-b border-slate-200/60 p-5 dark:border-slate-700/60">
            <h2 className="text-lg font-bold">Your conversations</h2>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-slate-500">
              Loading conversations...
            </p>
          ) : error ? (
            <p className="p-6 text-sm text-red-500">{error}</p>
          ) : conversations.length === 0 ? (
            <div className="flex min-h-[450px] flex-col items-center justify-center p-6 text-center">
              <div className="text-5xl">💬</div>
              <h3 className="mt-5 font-bold">
                No conversations yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Visit a user's profile and click Message to start chatting.
              </p>
              <Link to="/browse" className="btn-primary mt-6">
                Explore StudyHub
              </Link>
            </div>
          ) : (
            <div className="max-h-[650px] overflow-y-auto p-3">
              {conversations.map((conversation) => {
                const participant = getOtherParticipant(conversation)

                if (!participant) return null

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setSelectedId(conversation._id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-brand/5 ${
                      selectedId === conversation._id
                        ? "bg-brand/10"
                        : ""
                    }`}
                  >
                    {participant.avatarUrl ? (
                      <img
                        src={participant.avatarUrl}
                        alt={participant.name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">
                          {participant.name}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {conversation.lastMessage || "Start a conversation"}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        <div
          className={`min-w-0 flex-1 flex-col ${
            selectedId ? "flex" : "hidden md:flex"
          }`}
        >
          {!selectedId || !selectedConversation ? (
            <div className="hidden flex-1 flex-col items-center justify-center text-center md:flex">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-4xl">
                💬
              </div>
              <h2 className="mt-5 text-xl font-bold">
                Your messages
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <>
              {(() => {
                const participant = getOtherParticipant(selectedConversation)

                return (
                  <header className="flex items-center gap-3 border-b border-slate-200/60 p-4 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="rounded-xl p-2 text-xl hover:bg-slate-500/10 md:hidden"
                      aria-label="Back to conversations"
                    >
                      ←
                    </button>

                    {participant?.avatarUrl ? (
                      <img
                        src={participant.avatarUrl}
                        alt={participant.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                        {participant?.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate font-bold">
                        {participant?.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        StudyHub private chat
                      </p>
                    </div>
                  </header>
                )
              })()}

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
                {messagesLoading ? (
                  <p className="m-auto text-sm text-slate-500">
                    Loading messages...
                  </p>
                ) : messageError && messages.length === 0 ? (
                  <p className="m-auto text-sm text-red-500">
                    {messageError}
                  </p>
                ) : messages.length === 0 ? (
                  <div className="m-auto text-center">
                    <div className="text-4xl">👋</div>
                    <p className="mt-3 font-semibold">
                      Start your conversation
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Send your first message below.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user?.id

                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                            isMine
                              ? "rounded-br-md bg-brand text-white"
                              : "rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.text}
                          </p>
                          <div
                            className={`mt-1 text-right text-[10px] ${
                              isMine ? "text-white/70" : "text-slate-400"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                            {isMine && message.readAt ? " · Read" : ""}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                <div ref={bottomRef} />
              </div>

              {messageError && messages.length > 0 && (
                <p className="px-4 text-sm text-red-500">
                  {messageError}
                </p>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-t border-slate-200/60 p-3 dark:border-slate-700/60 sm:p-4"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  maxLength={2000}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-900/50"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {sending ? "…" : "➤"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
