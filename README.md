# AI Personal Companion

A full-stack web application serving as an intelligent personal companion. Features multiple AI models (Gemini, ChatGPT) for different contexts: Personal, Professional, Health, and Workout assistance.

## Features

- **Personal Chat**: Casual conversation using Gemini.
- **Professional Chat**: Knowledge-based assistance using ChatGPT.
- **Health & Workout**: Specialized AI assistance.
- **Smart Reminders**: Manage daily tasks and reminders.
- **Secure**: JWT Authentication, encrypted passwords.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB
- **AI**: Gemini API, OpenAI API
- **Deployment**: Vercel (Frontend), Render/Railway (Backend)

## Setup

1.  **Clone the repository**
2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```
3.  **Install Frontend Dependencies**
    ```bash
    cd client
    npm install
    ```
4.  **Environment Variables**
    - Create `.env` in `server/` and `client/` based on `.env.example`.
5.  **Run**
    - Backend: `npm start`
    - Frontend: `npm run dev`
