import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { getMyDetails, loginRequest } from "../service/auth"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getErrorMessage } from "../service/api"
import type { User } from "../types"

interface AuthState {
  user: User | null
  initializing: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  initializing: true,
  loading: false,
  error: null
}

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await loginRequest(email, password)
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    return data.user
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Login failed"))
  }
})

export const restoreSession = createAsyncThunk<User | null>("auth/restoreSession", async () => {
  if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
    return null
  }
  try {
    return await getMyDetails()
  } catch {
    clearTokens()
    return null
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearTokens()
      state.user = null
      state.error = null
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Login failed"
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initializing = false
        state.user = action.payload
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initializing = false
      })
  }
})

export const { logout, setUser, clearError } = authSlice.actions
export default authSlice.reducer