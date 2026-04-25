# FocusRoom: WebRTC Video Conferencing

FocusRoom is a modern, production-grade video conferencing web application built with React, Node.js, and WebRTC. It features real-time peer-to-peer video/audio communication, screen sharing, and integrated chat.

## 🚀 Key Features

- **P2P Video & Audio**: High-quality, low-latency communication using WebRTC.
- **Screen Sharing**: Seamless transition between camera and screen streams.
- **Real-time Chat**: In-meeting text communication with message persistence.
- **Dynamic Layouts**: Responsive grid system that adjusts based on participant count.
- **Identity Management**: Secure user authentication and registration.
- **Dark/Light Mode**: Full UI customization via Material UI (MUI).
- **STUN/TURN Integration**: Robust connection handling across different network topologies.

## 🏗️ Architecture

The project follows a modular, service-oriented architecture:

### Backend (Node.js/Express)
- **Service Layer**: Decoupled business logic for users and rooms.
- **Real-time Engine**: Socket.io for signaling and room orchestration.
- **Security**: Password hashing with Bcrypt and stateless sessions with JWT.
- **Persistence**: MongoDB (via Mongoose) for user data.

### Frontend (React/Vite)
- **Modular WebRTC**: Logic is decomposed into specialized `PeerManager` and `MediaService` modules.
- **State Mediation**: Centralized `MeetingContext` for decoupled UI state management.
- **UI Components**: Modern, accessible components built with Material UI v7.
- **Hooks**: Custom hooks (`useWebRTC`, `useSocket`) for lifecycle management.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Material UI, Axios, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose, JWT, Bcrypt.
- **Infrastructure**: Metered.live (TURN), Vercel (Deployment).

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/webRTC.git
   cd webRTC
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with JWT_SECRET, MONGODB_URL, METERED_API_KEY, METERED_APP_NAME
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd FocusRoom
   npm install
   # Ensure vite.config.js points to your backend URL
   npm run dev
   ```

## 📜 Documentation

Detailed architectural guides and refactor logs can be found in the [`/docs`](./docs) directory:
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Frontend Refactor Guide](./docs/FRONTEND_REFACTOR_GUIDE.md)
- [Security Audit Report](./docs/security_audit_report.md)

---

Developed by **MD Towfik Omer**
