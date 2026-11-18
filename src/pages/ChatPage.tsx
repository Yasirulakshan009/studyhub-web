
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
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [messageError, setMessageError] = useState("")
  const [returnToProfile, setReturnToProfile] = useState<string | null>(null)

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
      fromProfile?: boolean
      returnTo?: string
    } | null

    if (state?.conversationId) {
      setSelectedId(state.conversationId)

      if (state.fromProfile && state.returnTo) {
        setReturnToProfile(state.returnTo)
      }

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

    const handleDeletedMessage = (payload: {
      conversationId: string
      messageId: string
    }) => {
      if (payload.conversationId === selectedId) {
        setMessages((current) =>
          current.filter((message) => message._id !== payload.messageId)
        )
      }

      fetchConversations()
    }

    const joinConversation = () => {
      if (selectedId) {
        socket.emit("conversation:join", selectedId)
      }
    }

    socket.on("message:new", handleNewMessage)
    socket.on("notification:new", handleNotification)
    socket.on("message:deleted", handleDeletedMessage)
    socket.on("connect", joinConversation)

    if (socket.connected) {
      joinConversation()
    }

    return () => {
      if (selectedId) {
        socket.emit("conversation:leave", selectedId)
      }

      socket.off("message:new", handleNewMessage)
      socket.off("notification:new", handleNotification)
      socket.off("message:deleted", handleDeletedMessage)
      socket.off("connect", joinConversation)
      socket.disconnect()
      socketRef.current = null
    }
  }, [selectedId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [messages])

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedId || deletingMessageId) return

    if (!window.confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      setDeletingMessageId(messageId)
      setMessageError("")

      await api.delete(
        `/chat/conversations/${selectedId}/messages/${messageId}`
      )

      setMessages((current) =>
        current.filter((message) => message._id !== messageId)
      )

      fetchConversations()
    } catch (err) {
      setMessageError(
        getErrorMessage(err, "Failed to delete message")
      )
    } finally {
      setDeletingMessageId(null)
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
    <div className="flex h-full min-h-0 flex-col">
      {returnToProfile && (
        <Link
          to={returnToProfile}
          className="mb-3 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <span aria-hidden="true">←</span> Back to Profile
        </Link>
      )}

      <section className="glass flex min-h-0 min-w-0 flex-1 w-full overflow-hidden rounded-2xl border border-white/60 shadow-xl dark:border-white/10 sm:rounded-3xl">
        <aside
          className={`
            flex min-h-0 w-full shrink-0 flex-col
            border-r border-slate-200/90
            dark:border-slate-700/90
            md:w-[320px] lg:w-[360px]
            ${
              selectedId
                ? "hidden md:flex"
                : "flex"
            }
          `}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200/90 px-4 py-4 sm:px-5 dark:border-slate-700/90">
            <div className="min-w-0">
              <h2 className="text-lg font-bold">
                Your conversations
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {conversations.length} conversations
              </p>
            </div>

            <span className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg">
              💬
            </span>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <p className="text-sm text-slate-500">
                Loading conversations...
              </p>
            </div>
          ) : error ? (
            <div className="p-5">
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setError("")
                  fetchConversations()
                }}
                className="mt-3 text-sm font-semibold text-brand"
              >
                Try again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl">
                💬
              </div>
              <h3 className="mt-4 font-bold">
                No conversations yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Visit a user's profile and click Message to start chatting.
              </p>
              <button
                type="button"
                onClick={() => navigate("/browse")}
                className="btn-primary mt-5"
              >
                Explore StudyHub
              </button>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {conversations.map((conversation) => {
                const participant = getOtherParticipant(conversation)

                if (!participant) return null

                const isSelected = selectedId === conversation._id

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => {
                      setSelectedId(conversation._id)
                      setMessageError("")
                    }}
                    className={`
                      flex w-full items-center gap-3
                      border-b border-slate-200/90
                      px-4 py-4 text-left transition
                      last:border-b-0
                      dark:border-slate-700/90
                      ${
                        isSelected
                          ? "bg-brand/10"
                          : "hover:bg-brand/5"
                      }
                    `}
                  >
                    <div className="relative shrink-0">
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="h-12 w-12 rounded-full border border-white/70 object-cover object-top shadow-sm dark:border-slate-600"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      {conversation.unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">
                          {participant.name}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm ${
                            conversation.unreadCount > 0
                              ? "font-semibold text-slate-700 dark:text-slate-200"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                          title={conversation.lastMessage || "Start a conversation"}
                        >
                          {conversation.lastMessage || "Start a conversation"}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
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
          className={`min-h-0 min-w-0 flex-1 flex-col ${
            selectedId ? "flex" : "hidden md:flex"
          }`}
        >
          {!selectedId || !selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-4xl">
                💬
              </div>
              <h2 className="mt-5 text-xl font-bold">
                Your messages
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                Select a conversation to start chatting with your study community.
              </p>
            </div>
          ) : (
            <>
              {(() => {
                const participant = getOtherParticipant(selectedConversation)

                return (
                  <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/90 px-3 py-3 sm:px-5 dark:border-slate-700/90">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl hover:bg-slate-500/10 md:hidden"
                      aria-label="Back to conversations"
                    >
                      ←
                    </button>

                    {participant?.avatarUrl ? (
                      <img
                        src={participant.avatarUrl}
                        alt={participant.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                        {participant?.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate font-bold">
                        {participant?.name}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        StudyHub private chat
                      </p>
                    </div>
                  </header>
                )
              })()}

              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 sm:p-5">
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
                        className={`flex w-full ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] break-words rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                            isMine
                              ? "rounded-br-md bg-brand text-white"
                              : "rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.text}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <div
                              className={`text-[10px] ${
                                isMine ? "text-white/70" : "text-slate-400"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                              {isMine && message.readAt ? " · Read" : ""}
                            </div>

                            {isMine && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message._id)}
                                disabled={deletingMessageId === message._id}
                                className="text-[11px] font-semibold text-white/80 transition hover:text-white hover:underline disabled:opacity-50"
                              >
                                {deletingMessageId === message._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                <div ref={bottomRef} className="h-px shrink-0" />
              </div>

              {messageError && messages.length > 0 && (
                <p className="shrink-0 px-4 pb-2 text-sm text-red-500">
                  {messageError}
                </p>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex shrink-0 items-center gap-2 border-t border-slate-200/90 p-3 dark:border-slate-700/90 sm:p-4"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  maxLength={2000}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white sm:px-5"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
