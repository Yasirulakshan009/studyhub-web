import { io } from "socket.io-client"
import { ACCESS_TOKEN_KEY } from "./api"

export const createChatSocket = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!token) {
        return null
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL
    const serverUrl = apiUrl.replace(/\/api\/v1\/?$/, "")

    return io(serverUrl, {
        auth: {
            token
        },
        transports: ["websocket", "polling"],
        autoConnect: true
    })
}