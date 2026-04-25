# Project Architecture Overview: WebRTC FocusRoom

This document provides a high-level summary of the project architecture, generated via `code-review-graph` analysis.

## 📊 System Statistics
- **Communities:** 19
- **Cross-Community Dependencies:** 24
- **Primary Language:** JavaScript / React

---

## 🏗️ Core Architectural Pillars

### 1. The Real-Time Engine (Hooks)
The "brain" of the application resides in custom React hooks that manage the complex WebRTC and WebSocket lifecycles.
*   **`useWebRTC`**: The most complex community. It manages `RTCPeerConnection` instances, media tracks, and camera streams.
*   **`useSocket`**: Manages the persistent connection to the signaling server and provides an interface for emitting/listening to events.

### 2. Presentation & Orchestration (Pages)
The user journey is divided into specialized view controllers:
*   **`VideosMeeting`**: The critical meeting room hub. It orchestrates joining logic, chat messaging, screen sharing, and call termination.
*   **`Home`**: The user dashboard, managing meeting entry points and navigation between "Meetings" and "Calls" views.
*   **`Authentication`**: Entry portal for user login and registration.

### 3. Global State & Theme (Contexts)
Cross-cutting concerns are handled via React Context API to ensure data consistency:
*   **`AuthContext`**: Centralizes user identity and persistence (Login/Logout/Register).
*   **`ColorModeContext` & `ThemeContext`**: Provide dark/light mode capabilities across all UI components.

### 4. Signaling & API (Backend)
The backend acts as the "matchmaker" and data provider:
*   **`socketManager`**: The central relay. It handles room management and passes signaling data (Offers/Answers/ICE) between peers.
*   **`user_controller`**: Provides REST endpoints for authentication and fetching TURN server configurations.

---

## 🔗 Key Dependency Map

| Source | Destination | Purpose |
| :--- | :--- | :--- |
| `App.jsx` | All Pages/Contexts | Root orchestration and routing tree construction. |
| `VideosMeeting` | `useWebRTC` | Consumes core P2P logic to render video streams. |
| `Lobby` | `ColorModeContext` | UI styling synchronization before joining a call. |
| `useWebRTC` | `useSocket` | Uses the signaling bridge to exchange WebRTC handshakes. |
| `app.js` | `socketManager` | Initializes the real-time signaling server. |

---

*Generated on: 2026-04-08*
*Tools used: code-review-graph, Gemini CLI*
