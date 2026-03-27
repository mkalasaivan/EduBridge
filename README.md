# EduBridge

<div align="center">
  <h3>A Real-Time, Professional Mentorship & Resource Sharing Learning Platform.</h3>
</div>

---

## 📖 Overview

**EduBridge** is a modern, full-stack educational platform designed to bridge the gap between ambitious students and experienced mentors. It provides a robust architecture for users to share learning resources, connect with industry experts, and intuitively schedule mentorship sessions with automated Google Calendar synchronization.

Featuring a premium **"Floating Glass" UI** design, intelligent state management, and an extensively secure backend verification flow, EduBridge offers an unparalleled user and developer experience.

## ✨ Key Features

- **🔐 Secure Authentication**: Includes two-step email Verification (OTP) on registration, JWT token rotations, and seamless 1-Click **Google OAuth** login.
- **🧑‍🏫 Mentorship Scheduling**: Students can browse and request mentors. Once accepted, mentors use the integrated **Google Calendar API** to schedule real-time sessions.
- **📚 Resource Sharing Ecosystem**: Users can upload, discover, save, and discuss learning materials across different categories (PDFs, YouTube, GitHub, Medium, etc.).
- **📊 Interactive Dashboard**: A personalized dashboard that tracks active mentorship requests, displays upcoming calendar sessions, and highlights recently shared premium resources.
- **🔔 Real-time Notifications**: Custom WebSockets (Socket.io) and automated Email notifications (Nodemailer) keep users updated on session schedules and mentorship request updates.

---

## 🛠️ Technology Stack

EduBridge comprises two main modules — a responsive frontend UI and a highly scalable backend microservice architecture.

### Frontend
- **Framework**: React 18 / Vite
- **Styling**: TailwindCSS (Custom Glassmorphism features)
- **State Management**: Zustand (Auth, Notifications, Global State)
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Data Fetching**: Axios

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-Time Engine**: Socket.io (EventsGateway)
- **Email Service**: Nodemailer (MailingService)
- **Integrations**: Google Calendar API & OAuth2

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via Docker)
- A Google Cloud Platform (GCP) project for OAuth and Calendar APIs.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/mkalasaivan/EduBridge.git
cd EduBridge
\`\`\`

### 2. Backend Setup
Navigate to the \`backend\` directory to set up the NestJS service.
\`\`\`bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env 
# (Make sure to fill in your DATABASE_URL, JWT SECRETS, STMP details, and GOOGLE API Keys)

# Run Prisma Migrations
npx prisma migrate dev

# Start the development server
npm run start:dev
\`\`\`

### 3. Frontend Setup
Open a new terminal and navigate to the \`frontend\` directory.
\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
\`\`\`

You can now visit the application at \`http://localhost:5174\`!


## 🤝 Contributing

We welcome contributions! Please fork the repository, make your changes on a new branch, and submit a pull request. Make sure to update tests and documentation as appropriate.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
