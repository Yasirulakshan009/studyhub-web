# StudyHub – Frontend

## Overview

StudyHub is a student resource-sharing platform designed to help students share, discover, and access educational resources. Users can upload PDF notes, browse available resources, preview documents, download notes, and manage their uploaded resources.

The platform also provides administrative features for managing categories and reviewing uploaded notes, along with AI-powered PDF summarization.

This repository contains the frontend application of StudyHub, developed using React, TypeScript, and modern frontend technologies.

**Academic Module:** ITS2020 – Rapid Application Development (RAD)

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Redux
- React Router DOM
- Axios
- PDF.js (`pdfjs-dist`)
- ESLint

## Main Features

### 1. User Authentication

- User registration and login
- JWT-based authentication
- Automatic access token refresh
- Protected routes
- Forgot password functionality
- Password reset functionality
- User profile management
- Password change functionality
- Form validation

### 2. Note Management

- Upload PDF resources
- Edit uploaded note details
- View personal uploaded notes
- Delete uploaded notes
- Display note submission status
- Display rejection reasons
- Download PDF resources

### 3. Browse Resources

- Browse available educational resources
- Search notes
- Filter notes
- Sort notes by different criteria
- Pagination support
- View individual note details

### 4. PDF Viewer

- Preview PDF documents within the application
- View resources before downloading
- PDF rendering using PDF.js

### 5. AI-Powered Summarization

- Generate AI-powered summaries for PDF resources
- Display generated summaries within the application

### 6. Admin Features

- Admin dashboard
- Category management
- Create, update, and delete categories
- Review pending note submissions
- Preview uploaded PDF documents
- Approve or reject submitted notes
- Provide rejection reasons

### 7. User Interface

- Responsive design for desktop, tablet, and mobile devices
- Light and dark theme support
- Reusable React components
- Form validation
- Loading and error handling

## Project Structure

```text
studyhub-web/
├── public/
├── src/
│   ├── assets/
│   │   └── screenshot/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── router/
│   ├── service/
│   ├── store/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- StudyHub Backend API

### 1. Clone the Repository

```bash
git clone https://github.com/Yasirulakshan009/studyhub-web.git
```

### 2. Navigate to the Project Directory

```bash
cd studyhub-web
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Update the API URL according to your backend configuration.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at the local URL provided by Vite, usually:

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint |

## Backend Integration

The frontend communicates with the StudyHub REST API using Axios.

**Backend Repository:**

https://github.com/Yasirulakshan009/studyhub-api

**Local API Base URL:**

```text
http://localhost:5000/api/v1
```

The frontend integrates with API endpoints for:

- Authentication and user management
- Category management
- Note management
- PDF preview and downloads
- AI-powered summaries
- Administrative note reviews

## Architecture

The frontend follows a component-based architecture using React.

- **Components:** Reusable user interface elements.
- **Pages:** Application pages and views.
- **Services:** API communication using Axios.
- **Redux Toolkit:** Centralized application state management.
- **Router:** Client-side navigation and protected routes.
- **Hooks:** Reusable application logic.

## Screenshots

### 1. Home Page

![Home Page](src/assets/screenshot/Home%20Page1.png)

![Home Page - Additional View](src/assets/screenshot/Home%20Page2.png)

### 2. User Authentication

**Login Page**

![Login Page](src/assets/screenshot/Login%20Page.png)

**Registration Page**

![Registration Page](src/assets/screenshot/Register%20Page.png)

**Forgot Password Page**

![Forgot Password Page](src/assets/screenshot/Froget%20Password.png)

### 3. Browse Resources

![Browse Resources - First View](src/assets/screenshot/Bows%20Page1.png)

![Browse Resources - Second View](src/assets/screenshot/Bows%20Page2.png)

### 4. View Note

![View Note](src/assets/screenshot/View%20Note.png)

### 5. PDF Preview

![PDF Preview](src/assets/screenshot/Preview%20PDF.png)

### 6. AI-Powered Summarization

![AI Summarization](src/assets/screenshot/AI%20Summerize.png)

### 7. My Notes

![My Notes](src/assets/screenshot/My%20Notes%20Page.png)

### 8. Upload Resources

![Upload Note](src/assets/screenshot/Upload%20Page.png)

### 9. User Profile

![User Profile](src/assets/screenshot/Profile%20Page.png)

### 10. Admin Dashboard

**Pending Note Reviews**

![Admin Dashboard](src/assets/screenshot/Admin%20Page1.png)

**Category Management**

![Category Management](src/assets/screenshot/Admin%20Page2.png)

### 11. Dark Mode

![Dark Mode](src/assets/screenshot/Dark%20Mood.png)

### 12. Responsive Design

**Mobile View**

![Mobile Responsive Design](src/assets/screenshot/Mobile%20Responsive.png)

**Tablet View**

![Tablet Responsive Design](src/assets/screenshot/Tablet%20Responsive.png)

## Related Repository

**StudyHub Backend API:**

https://github.com/Yasirulakshan009/studyhub-api

## Developer

Developed as part of the ITS2020 – Rapid Application Development (RAD) coursework.