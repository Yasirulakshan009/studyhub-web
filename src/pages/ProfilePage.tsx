
import { useEffect, useState, type FormEvent } from "react"
import LoadingSpinner from "../components/common/LoadingSpinner"
import InputField from "../components/forms/InputField"
import { useAppDispatch } from "../hooks/redux"
import api, { getErrorMessage } from "../service/api"
import { getMyDetails, updateMyProfile } from "../service/auth"
import { getMyNotes } from "../service/note"
import { setUser } from "../store/authSlice"
import type { Note, User } from "../types"

const MIN_PASSWORD = 6

const cardClass = "glass rounded-[2rem] p-6 sm:p-8"
const mutedClass = "text-slate-500 dark:text-slate-400"
const valueClass =
  "rounded-2xl border border-slate-300 bg-white/50 px-4 py-3 dark:border-white/15 dark:bg-white/5"
const outlineClass =
  "rounded-full border border-slate-300 bg-white/50 px-5 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-white/10"
const successClass =
  "rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
const errorClass = "rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"

const raisedClass =
  "rounded-3xl border border-white/80 bg-gradient-to-b from-white/85 to-white/45 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(15_23_42/0.05),0_14px_32px_rgb(15_23_42/0.13)] transition duration-200 hover:-translate-y-1 dark:border-white/15 dark:from-white/15 dark:to-white/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_14px_32px_rgb(0_0_0/0.45)]"

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-white/90 via-sky-100/70 to-sky-300/50 text-2xl font-semibold text-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-12px_18px_rgb(10_132_255/0.14),0_12px_28px_rgb(10_132_255/0.3)] dark:border-white/25 dark:from-white/30 dark:via-sky-300/15 dark:to-sky-500/30 dark:text-white">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-1 h-6 rounded-full bg-gradient-to-b from-white/90 to-white/0 dark:from-white/40"
      />
      <span className="relative">{getInitials(name)}</span>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${raisedClass} p-5`}>
      <p className={`text-sm font-medium ${mutedClass}`}>{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()

  const [profile, setProfile] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [notesError, setNotesError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")
  const [profileError, setProfileError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("")
  const [registeringAdmin, setRegisteringAdmin] = useState(false)
  const [adminMessage, setAdminMessage] = useState("")
  const [adminError, setAdminError] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const data = await getMyDetails()

        if (!mounted) return

        setProfile(data)
        setName(data.name)
        setEmail(data.email)
        dispatch(setUser(data))
      } catch (error) {
        if (mounted) {
          setProfileError(getErrorMessage(error))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    async function loadNotes() {
      try {
        const data = await getMyNotes()

        if (mounted) {
          setNotes(data)
          setNotesError("")
        }
      } catch (error) {
        if (mounted) {
          setNotesError(getErrorMessage(error))
        }
      }
    }

    loadProfile()
    loadNotes()

    return () => {
      mounted = false
    }
  }, [dispatch])

  const handleEditProfile = () => {
    if (!profile) return

    setName(profile.name)
    setEmail(profile.email)
    setProfileCurrentPassword("")
    setProfileMessage("")
    setProfileError("")
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    if (!profile) return

    setName(profile.name)
    setEmail(profile.email)
    setProfileCurrentPassword("")
    setProfileMessage("")
    setProfileError("")
    setIsEditingProfile(false)
  }

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!profile) return

    setProfileMessage("")
    setProfileError("")

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (cleanName.length < 2) {
      setProfileError("Name must contain at least 2 characters.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(cleanEmail)) {
      setProfileError("Please enter a valid email address.")
      return
    }

    const hasChanges = cleanName !== profile.name || cleanEmail !== profile.email

    if (!hasChanges) {
      setProfileError("No changes have been made.")
      return
    }

    if (!profileCurrentPassword.trim()) {
      setProfileError("Enter your current password to update your profile.")
      return
    }

    setSavingProfile(true)

    try {
      const updatedUser = await updateMyProfile({
        name: cleanName,
        email: cleanEmail,
        currentPassword: profileCurrentPassword
      })

      setProfile(updatedUser)
      setName(updatedUser.name)
      setEmail(updatedUser.email)

      dispatch(setUser(updatedUser))

      setProfileCurrentPassword("")
      setProfileMessage("Profile updated successfully!")
      setIsEditingProfile(false)
    } catch (error) {
      setProfileError(getErrorMessage(error))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setPasswordMessage("")
    setPasswordError("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.")
      return
    }

    if (newPassword.length < MIN_PASSWORD) {
      setPasswordError(`New password must contain at least ${MIN_PASSWORD} characters.`)
      return
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from your current password.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.")
      return
    }

    setSavingPassword(true)

    try {
      await updateMyProfile({
        currentPassword,
        newPassword
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage("Password changed successfully!")
    } catch (error) {
      setPasswordError(getErrorMessage(error))
    } finally {
      setSavingPassword(false)
    }
  }

  // Register another Admin
  const handleAdminRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setAdminMessage("")
    setAdminError("")

    const cleanName = adminName.trim()
    const cleanEmail = adminEmail.trim()

    if (cleanName.length < 2) {
      setAdminError("Name must contain at least 2 characters.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(cleanEmail)) {
      setAdminError("Please enter a valid email address.")
      return
    }

    if (adminPassword.length < MIN_PASSWORD) {
      setAdminError(`Password must contain at least ${MIN_PASSWORD} characters.`)
      return
    }

    if (adminPassword !== adminConfirmPassword) {
        setAdminError("Passwords do not match.")
        return
    }

    setRegisteringAdmin(true)

    try {
      const response = await api.post<{ message: string }>("/auth/register-admin", {
        name: cleanName,
        email: cleanEmail,
        password: adminPassword
      })

      setAdminName("")
      setAdminEmail("")
      setAdminPassword("")
      setAdminConfirmPassword("")

      setAdminMessage(
        response.data.message || "New administrator registered successfully!"
      )
    } catch (error) {
      setAdminError(getErrorMessage(error, "Admin registration failed."))
    } finally {
      setRegisteringAdmin(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading your profile" />
  }

  if (!profile) {
    return (
      <div className={cardClass}>
        <p role="alert" className="text-red-600 dark:text-red-400">
          {profileError || "Unable to load profile information."}
        </p>
      </div>
    )
  }

  const isAdmin = profile.roles.includes("ADMIN")

  const approvedNotes = notes.filter((note) => note.status === "APPROVED").length
  const pendingNotes = notes.filter((note) => note.status === "PENDING").length
  const rejectedNotes = notes.filter((note) => note.status === "REJECTED").length

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={profile.name} />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight">{profile.name}</h1>
            <p className={`mt-1 truncate text-sm ${mutedClass}`}>{profile.email}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className={`${raisedClass} self-start px-5 py-3 sm:self-center`}>
            <p className={`text-xs ${mutedClass}`}>Account type</p>
            <p className="mt-0.5 text-base font-semibold">
              {isAdmin ? "Administrator" : "Student"}
            </p>
          </div>
        </div>
      </section>

      <section className={cardClass} aria-labelledby="contributions-heading">
        <h2 id="contributions-heading" className="text-lg font-semibold tracking-tight">
          Contributions
        </h2>

        {notesError && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {notesError}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Total notes" value={notes.length} />
          <StatTile label="Approved" value={approvedNotes} />
          <StatTile label="Pending" value={pendingNotes} />
          <StatTile label="Rejected" value={rejectedNotes} />
        </div>
      </section>

      <section className={cardClass} aria-labelledby="personal-heading">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="personal-heading" className="text-lg font-semibold tracking-tight">
              Personal information
            </h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>Manage your personal account information.</p>
          </div>

          {!isEditingProfile && (
            <button type="button" onClick={handleEditProfile} className="btn-primary">
              Edit profile
            </button>
          )}
        </div>

        {profileMessage && (
          <div role="status" className={`mb-5 ${successClass}`}>
            {profileMessage}
          </div>
        )}

        {profileError && (
          <div role="alert" className={`mb-5 ${errorClass}`}>
            {profileError}
          </div>
        )}

        {!isEditingProfile ? (
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Full name
              </dt>
              <dd className={valueClass}>{profile.name}</dd>
            </div>

            <div>
              <dt className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Email address
              </dt>
              <dd className={`${valueClass} break-all`}>{profile.email}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={handleProfileUpdate} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Full name"
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
              />

              <InputField
                label="Email address"
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </div>

            <div className="border-t border-slate-300/50 pt-5 dark:border-white/10">
              <h3 className="mb-1 text-sm font-semibold">Confirm your identity</h3>
              <p className={`mb-4 text-sm ${mutedClass}`}>
                Enter your current password to save profile changes.
              </p>

              <div className="max-w-md">
                <InputField
                  label="Current password"
                  id="profile-current-password"
                  type="password"
                  value={profileCurrentPassword}
                  onChange={(event) => setProfileCurrentPassword(event.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingProfile}
                className={outlineClass}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      <section className={cardClass} aria-labelledby="password-heading">
        <div className="mb-6">
          <h2 id="password-heading" className="text-lg font-semibold tracking-tight">
            Change password
          </h2>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Update your password to keep your account secure.
          </p>
        </div>

        {passwordMessage && (
          <div role="status" className={`mb-5 ${successClass}`}>
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div role="alert" className={`mb-5 ${errorClass}`}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Current password"
              id="password-current"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />

            <div className="hidden sm:block" />

            <InputField
              label="New password"
              id="password-new"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={`At least ${MIN_PASSWORD} characters`}
              autoComplete="new-password"
            />

            <InputField
              label="Confirm new password"
              id="password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </section>

      {isAdmin && (
        <section className={cardClass} aria-labelledby="admin-registration-heading">
          <div className="mb-6">
            <h2
              id="admin-registration-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Register new admin
            </h2>

            <p className={`mt-1 text-sm ${mutedClass}`}>
              Create another administrator account for StudyHub.
            </p>
          </div>

          {adminMessage && (
            <div role="status" className={`mb-5 ${successClass}`}>
              {adminMessage}
            </div>
          )}

          {adminError && (
            <div role="alert" className={`mb-5 ${errorClass}`}>
              {adminError}
            </div>
          )}

          <form
            onSubmit={handleAdminRegistration}
            noValidate
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Admin name"
                id="admin-name"
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                placeholder="Enter admin name"
                autoComplete="name"
              />

              <InputField
                label="Admin email address"
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="Enter admin email address"
                autoComplete="email"
              />

              <InputField
                label="Admin password"
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder={`At least ${MIN_PASSWORD} characters`}
                autoComplete="new-password"
              />

                <InputField
                label="Confirm password"
                id="admin-confirm-password"
                type="password"
                value={adminConfirmPassword}
                onChange={(event) => setAdminConfirmPassword(event.target.value)}
                placeholder="Re-enter admin password"
                autoComplete="new-password"
                />
            </div>

            <div className="border-t border-slate-300/50 pt-5 dark:border-white/10">
              <p className={`mb-4 text-sm ${mutedClass}`}>
                The new account will automatically receive the ADMIN role.
              </p>

              <button
                type="submit"
                disabled={registeringAdmin}
                className="btn-primary"
              >
                {registeringAdmin ? "Registering..." : "Register admin"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}
