# StudyHub – Frontend

## Overview

StudyHub is a student resource-sharing platform. Students can upload PDF notes, search and browse approved resources, preview and download them, and manage their own uploads. Every upload is reviewed by an admin before it becomes publicly available. Approved notes can also be summarised using AI.

This repository contains the frontend of StudyHub, built with React, TypeScript and Tailwind CSS as part of the **ITS2020 – Rapid Application Development (RAD)** final coursework.

## Live Demo

| Part | URL |
|---|---|
| Frontend | [https://my-studyhub-platform.netlify.app](https://my-studyhub-platform.netlify.app) |
| Backend API | [https://studyhub-api-l9ey.onrender.com/api/v1](https://studyhub-api-l9ey.onrender.com/api/v1) |
| Backend Health Check | [https://studyhub-api-l9ey.onrender.com/api/v1/health](https://studyhub-api-l9ey.onrender.com/api/v1/health) |

The backend is hosted on Render. When the service has been inactive, the first request may take some time while the server starts.

**Backend repository:** [https://github.com/Yasirulakshan009/studyhub-api](https://github.com/Yasirulakshan009/studyhub-api)

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit and React Redux
- React Router
- Axios
- PDF.js (`pdfjs-dist`)
- Socket.IO Client
- React Easy Crop
- ESLint

## Main Features

### 1. Authentication and User Accounts

- User registration and login with form validation.
- JWT-based authentication using access and refresh tokens.
- Automatic access token refresh when it expires.
- Session restoration after page reload.
- Protected routes for authenticated users.
- Admin-only route protection.
- Forgot password and reset password through an emailed link.
- User profile management.
- Update profile information, including name and email.
- Change account password.
- Upload and update profile photos.

### 2. Browse and Search Notes

- Browse approved study resources.
- Search notes by title, subject or keyword.
- Filter notes by category and sub-category.
- Sort notes by newest, oldest, most downloaded or best match.
- Pagination for browsing large collections.
- URL-based filters that allow search results to be shared.
- Loading, empty and error states.

### 3. Note Details, PDF Preview and Download

- View detailed information about each note.
- Display note category, tags, uploader information and download count.
- Preview PDF documents directly in the browser using PDF.js.
- Download notes for authenticated users.
- Generate AI-powered summaries of approved notes.
- Display AI-generated overviews and key points.
- Save generated summaries so they can be loaded again without unnecessary regeneration.

### 4. My Notes

- Upload PDF notes with a title, description, category, subject and tags.
- Confirm ownership before submitting an upload.
- View uploaded notes and their review statuses.
- Track Pending, Approved and Rejected notes.
- View rejection reasons.
- Edit, view, download and delete personal uploads.

### 5. User Profiles and Likes

- View public user profiles.
- Display user profile information and uploaded resources.
- Upload and update profile pictures.
- Like and unlike notes.
- View like information on supported note pages.

### 6. Real-Time Chat

- Start conversations with other users.
- View existing conversations.
- Send and receive messages in real time using Socket.IO.
- Load conversation message history.
- Display message read status.
- Delete own messages.
- Receive real-time message and notification updates.

### 7. Admin Panel

- Review pending note submissions.
- Preview uploaded PDFs during review.
- Approve submitted notes.
- Reject notes with a rejection reason.
- Manage categories and sub-categories.
- Create, edit and delete categories.

### 8. User Interface and Experience

- Responsive design for desktop, tablet and mobile devices.
- Bottom navigation on smaller screens.
- Light and dark themes.
- Remember the selected theme.
- Reusable components and shared styling.
- Consistent layouts across application pages.
- Form validation and user-friendly feedback.
- Semantic HTML and labelled form fields.
- Keyboard-friendly dropdowns and dialogs.
- Visible focus styles and reduced-motion support.

## Pages and Access

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/browse` | Browse and search notes | Public |
| `/notes/:id` | Note details | Public |
| `/login` | Login | Public |
| `/register` | Registration | Public |
| `/forgot-password` | Forgot password | Public |
| `/reset-password` | Reset password | Public |
| `/upload` | Upload a note | Authenticated |
| `/my-notes` | My notes | Authenticated |
| `/my-notes/:id/edit` | Edit a note | Authenticated |
| `/profile` | User profile | Authenticated |
| `/users/:userId` | Public user profile | Public |
| `/chat` | Real-time chat | Authenticated |
| `/admin` | Pending note review | Admin |
| `/admin/categories` | Category management | Admin |

Some note actions, including downloading and generating AI summaries, require authentication.

## Project Structure

```text
studyhub-web/
├── public/
├── src/
│   ├── assets/
│   │   └── screenshot/
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── note/
│   ├── hooks/
│   ├── pages/
│   ├── router/
│   ├── service/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
└── vite.config.ts
```

## Installation and Setup

### Prerequisites

- Node.js 20 or later.
- npm.
- StudyHub backend running locally or deployed.

### 1. Clone the Repository

```bash
git clone https://github.com/Yasirulakshan009/studyhub-web.git
cd studyhub-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For the deployed backend, use:

```env
VITE_API_BASE_URL=https://studyhub-api-l9ey.onrender.com/api/v1
```

Use the appropriate backend URL for your environment.

Restart the development server after changing environment variables.

### 4. Run the Development Server

```bash
npm run dev
```

Open the application at:

[http://localhost:5173](http://localhost:5173)

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript checks and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Architecture

- **Components:** Reusable UI components shared across application pages.
- **Pages and Router:** Each page is connected to a route. Route guards protect authenticated and admin-only pages.
- **Redux Toolkit:** Manages authentication state, user information, loading states and errors.
- **Service Layer:** Axios handles API communication, access token attachment and automatic token refresh.
- **Hooks:** Custom hooks provide authentication and theme functionality.
- **Real-Time Communication:** Socket.IO Client connects to the backend for chat and live updates.
- **PDF Rendering:** PDF.js renders PDF documents inside the application.
- **Styling:** Tailwind CSS and shared styles provide a consistent responsive interface.

## Backend Integration

The frontend communicates with the StudyHub REST API using Axios.

The backend provides services for:

- User authentication and account management.
- Password recovery and reset.
- User profiles and profile images.
- Note uploads and management.
- Categories and sub-categories.
- Note searching and browsing.
- PDF downloads.
- AI-powered note summaries.
- Note likes.
- Conversations and messages.
- Message deletion and read status.
- Admin note review and category management.

Real-time chat and notifications are supported through Socket.IO.

**Backend repository:** [StudyHub API](https://github.com/Yasirulakshan009/studyhub-api)

## Deployment

The StudyHub frontend is deployed on Netlify, while the backend API is hosted on Render.

### Frontend Deployment

The frontend can be deployed using Netlify.

1. Connect the frontend GitHub repository to Netlify.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Configure the environment variable:

```env
VITE_API_BASE_URL=https://studyhub-api-l9ey.onrender.com/api/v1
```

5. Deploy the application.

### Backend Deployment

The backend is deployed separately on Render.

The frontend requires the backend API URL to be configured correctly before deployment.

## Known Limitations

- Access and refresh tokens are stored in `localStorage`. This is convenient but can expose tokens if the application is affected by cross-site scripting (XSS). HttpOnly cookies would provide stronger protection.
- PDF preview is limited to the first 40 pages.
- The backend may take some time to respond to the first request after an inactive period because of the hosting service's sleep behaviour.
- AI summary generation depends on the availability and configuration of the external AI service.

## Screenshots

### 1. Home Page

![Home Page](src/assets/screenshot/Home%20Page1.png)

![Home Page - Additional View](src/assets/screenshot/Home%20Page2.png)

### 2. Authentication

**Login**

![Login Page](src/assets/screenshot/Login%20Page.png)

**Register**

![Registration Page](src/assets/screenshot/Register%20Page.png)

**Forgot Password**

![Forgot Password Page](src/assets/screenshot/Froget%20Password.png)

### 3. Browse Resources

![Browse Resources - First View](src/assets/screenshot/Brows%20Page.png)


### 4. Note Details

![View Note](src/assets/screenshot/View%20Note.png)

### 5. PDF Preview

![PDF Preview](src/assets/screenshot/Preview%20PDF.png)

### 6. AI Summarization

![AI Summarization](src/assets/screenshot/AI%20Summerize.png)

### 7. My Notes

![My Notes](src/assets/screenshot/My%20Notes%20Page.png)

### 8. Upload a Note

![Upload Note](src/assets/screenshot/Upload%20Page.png)

### 9. Private User Profile

![Private User Profile](src/assets/screenshot/Private%20Profile%20Page.png)

### 9. Public User Profile

![Public User Profile](src/assets/screenshot/Public%20Profile%20Page.png)

### 10. Admin Panel

**Pending Note Review**

![Admin Review](src/assets/screenshot/Admin%20Page.png)

**Category Management**

![Category Management](src/assets/screenshot/Create%20Category.png)

### 11. Chat Window

![Chat Window](src/assets/screenshot/Chat%20Page.png)

### 12. Dark Mode

![Dark Mode](src/assets/screenshot/Dark%20Mood.png)

### 13. Responsive Design

**Mobile**

![Mobile Responsive Design](src/assets/screenshot/Mobile%20Responsive.png)

**Tablet**

![Tablet Responsive Design](src/assets/screenshot/Tablet%20Responsive.png)

## Developer

Developed as part of the **ITS2020 – Rapid Application Development (RAD)** final coursework.