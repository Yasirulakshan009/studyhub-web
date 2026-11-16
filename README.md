# StudyHub – Frontend

## Overview

StudyHub is a student resource-sharing platform. Students can upload PDF notes, search and browse approved resources, preview and download them, and manage their own uploads. Every upload is reviewed by an admin before it becomes public, and approved notes can be summarised with AI.

This repository contains the **frontend**, built with React, TypeScript and Tailwind CSS as part of the **ITS2020 – Rapid Application Development (RAD)** final coursework.

## Live Demo

| Part | URL |
|---|---|
| Frontend (Vercel) | `https://your-frontend.vercel.app` |
| Backend API (Render) | `https://your-api.onrender.com/api/v1` |

> The backend runs on a free Render instance that sleeps when idle. The first request after a break (for example logging in) can take up to a minute.

**Backend repository:** https://github.com/Yasirulakshan009/studyhub-api

## Technologies Used

- React and TypeScript (functional components and hooks)
- Vite
- Tailwind CSS
- Redux Toolkit and React Redux
- React Router
- Axios
- PDF.js (`pdfjs-dist`)
- ESLint

## Main Features

### 1. Authentication
- Registration and login with form validation.
- JWT access token with automatic refresh when it expires.
- The session is restored when the page is reloaded.
- Protected routes for logged-in users and admin-only routes.
- Forgot password and reset password through an emailed link.
- Profile page: update name and email, change password, and see upload statistics.

### 2. Browse and search
- Search by title, subject or keyword.
- Filter by category and sub-category, sort by newest, oldest, most downloaded or best match.
- Pagination, with filters kept in the URL so links can be shared.
- Loading, empty and error states on every data page.

### 3. Note details, PDF preview and download
- Note details with category, tags, uploader and download count.
- In-app PDF preview rendered with PDF.js (no file download needed).
- Download for logged-in users.
- AI summary: generate a short overview and key points of an approved note. Saved summaries load instantly.

### 4. My notes
- Upload a PDF with title, description, category, subject and tags, and confirm ownership.
- See the status of each note (Pending, Approved, Rejected) and the rejection reason.
- Edit, view, download and delete your own notes.

### 5. Admin panel
- Review pending notes with an in-page PDF preview.
- Approve a note, or reject it with a reason.
- Manage categories and sub-categories (create, edit, delete).

### 6. User interface
- Responsive layout for desktop, tablet and mobile, with a bottom tab bar on small screens.
- Light and dark theme (the choice is remembered).
- Consistent design system built from reusable components and shared styles.
- Accessibility: semantic HTML, labelled form fields, keyboard-friendly dropdowns and dialogs, visible focus styles and reduced-motion support.

## Pages and Access

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/browse` | Browse and search notes | Public |
| `/notes/:id` | Note details | Public (approved notes). Preview, download and AI summary need login |
| `/login`, `/register` | Login, register | Public |
| `/forgot-password`, `/reset-password` | Password reset | Public |
| `/upload` | Upload a note | Logged in |
| `/my-notes`, `/my-notes/:id/edit` | My notes, edit a note | Logged in |
| `/profile` | Profile and password | Logged in |
| `/admin` | Pending note review | Admin |
| `/admin/categories` | Category management | Admin |

## Project Structure

```text
studyhub-web/
├── public/                 # logo and favicon
├── src/
│   ├── assets/
│   │   └── screenshot/     # README screenshots
│   ├── components/
│   │   ├── common/         # Dropdown, Pagination, StatusBadge, EmptyState, dialogs
│   │   ├── forms/          # InputField, TextAreaField, FileField
│   │   ├── layout/         # Header, Footer, BottomNav, MainLayout, AdminLayout
│   │   └── note/           # NoteCard, PdfViewer, AiSummaryCard
│   ├── hooks/              # useAuth, useTheme, typed Redux hooks
│   ├── pages/              # one file per page
│   ├── router/             # routes and route guards
│   ├── service/            # Axios client and API functions
│   ├── store/              # Redux store and auth slice
│   ├── types/              # shared TypeScript types
│   ├── utils/              # formatting helpers
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── vercel.json             # SPA rewrite for deployment
└── vite.config.ts
```

## Installation and Setup

### Prerequisites

- Node.js 20 or later and npm
- The StudyHub backend running locally or deployed (see the [backend repository](https://github.com/Yasirulakshan009/studyhub-api))

### 1. Clone the repository

```bash
git clone https://github.com/Yasirulakshan009/studyhub-web.git
cd studyhub-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Use your backend URL here. For the deployed backend use `https://your-api.onrender.com/api/v1`. Restart the dev server after changing `.env`.

### 4. Run the development server

```bash
npm run dev
```

Open `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Architecture

- **Components:** reusable UI building blocks shared across pages.
- **Pages and router:** each page is a route. Guard components redirect visitors who are not logged in, and non-admins away from admin pages.
- **Redux Toolkit:** the `auth` slice holds the logged-in user, loading and error state, and restores the session on page load. Login and session restore are async thunks.
- **Service layer:** one Axios client adds the access token to requests and refreshes it automatically when it expires. API functions live in `service/`.
- **Hooks:** `useAuth` exposes the current user and admin flag, `useTheme` handles the light and dark theme.
- **Styling:** Tailwind CSS with shared custom styles (glass surfaces, primary button) so every page looks consistent.

## Backend Integration

The frontend talks to the StudyHub REST API through Axios for authentication, categories, notes, PDF preview and download, AI summaries and admin review. See the backend README for the endpoint list.

## Known Limitations

- Access and refresh tokens are stored in `localStorage`. This is simple but exposed to script injection. An HttpOnly cookie would be safer for a production system.
- Admin tools cover note review and categories. There is no statistics dashboard.
- PDF preview shows the first 40 pages.

## Screenshots

### 1. Home page
![Home Page](src/assets/screenshot/Home%20Page1.png)

![Home Page - Additional View](src/assets/screenshot/Home%20Page2.png)

### 2. Authentication

**Login**

![Login Page](src/assets/screenshot/Login%20Page.png)

**Register**

![Registration Page](src/assets/screenshot/Register%20Page.png)

**Forgot password**

![Forgot Password Page](src/assets/screenshot/Froget%20Password.png)

### 3. Browse resources
![Browse Resources - First View](src/assets/screenshot/Brows%20Page1.png)

![Browse Resources - Second View](src/assets/screenshot/Brows%20Page2.png)

### 4. Note details
![View Note](src/assets/screenshot/View%20Note.png)

### 5. PDF preview
![PDF Preview](src/assets/screenshot/Preview%20PDF.png)

### 6. AI summary
![AI Summarization](src/assets/screenshot/AI%20Summerize.png)

### 7. My notes
![My Notes](src/assets/screenshot/My%20Notes%20Page.png)

### 8. Upload a note
![Upload Note](src/assets/screenshot/Upload%20Page.png)

### 9. Profile
![User Profile](src/assets/screenshot/Profile%20Page.png)

### 10. Admin panel

**Pending note review**

![Admin Review](src/assets/screenshot/Admin%20Page1.png)

**Category management**

![Category Management](src/assets/screenshot/Admin%20Page2.png)

### 11. Dark mode
![Dark Mode](src/assets/screenshot/Dark%20Mood.png)

### 12. Responsive design

**Mobile**

![Mobile Responsive Design](src/assets/screenshot/Mobile%20Responsive.png)

**Tablet**

![Tablet Responsive Design](src/assets/screenshot/Tablet%20Responsive.png)

## Developer

Developed as part of the ITS2020 – Rapid Application Development (RAD) coursework.