# FocusRoom End-to-End User Workflows

This document defines the structured user workflows for FocusRoom, following the `workflow-patterns` guidelines. These workflows serve as the blueprint for implementation and verification.

---

## 🟢 Workflow 1: Discovery & Authentication
**Goal**: Guide a new user from the landing page to a functional home dashboard.

### Steps
1.  **Landing**: User visits `/`.
    *   *Verification*: Landing page renders with "Get Started" and "Sign Up Free" CTAs.
2.  **Auth**: User clicks "Sign Up Free" or "Get Started" -> Redirects to `/auth`.
    *   *Verification*: Auth page renders with Login/Register options.
3.  **Success**: User logs in/registers successfully -> Redirects to `/home`.
    *   *Verification*: `AuthProvider` stores token; user redirected to Home dashboard.

---

## 🟡 Workflow 2: Meeting Initiation & Navigation
**Goal**: Allow users to create or join specific meeting rooms.

### Steps
1.  **Create**: From `/home`, user clicks "New Meeting".
    *   *Action*: System generates a unique `meetingId` and redirects to `/:meetingId`.
    *   *Verification*: URL changes to a unique room path.
2.  **Join via URL**: User pastes a shared meeting link (e.g., `focusroom.app/abcd-1234`).
    *   *Verification*: `VideosMeeting.jsx` loads the room based on the URL parameter.

---

## 🟠 Workflow 3: Pre-Meeting Prep (Lobby)
**Goal**: Ensure media quality and user readiness before entering the live call.

### Steps (Implemented/Fixing)
1.  **Permission Request**: Page loads -> Browser asks for Camera/Mic permissions.
    *   *Action*: `getMedia()` is called.
    *   *Verification*: Media prompt appears; `localStream` state is populated.
2.  **Media Preview**: User sees their video feed in the `Lobby` component.
    *   *Verification*: `<video>` element in Lobby shows live camera feed.
3.  **Config**: User toggles Camera/Mic off if desired.
    *   *Verification*: `videoEnabled`/`audioEnabled` states update; tracks are enabled/disabled.
4.  **Identity**: User enters `username` and clicks "Join Meeting".
    *   *Action*: `handleJoin()` triggers `startMeeting(username)`.
    *   *Verification*: Lobby disappears; Meeting Room UI renders.

---

## 🔵 Workflow 4: Active Meeting Interaction
**Goal**: Facilitate real-time collaboration between peers.

### Steps
1.  **Signaling & Connection**: System connects to Socket server and exchanges WebRTC offers/answers.
    *   *Verification*: `remoteVideos` array populates as other users join.
2.  **Media Control**: User toggles Mic/Cam during the call.
    *   *Verification*: `MeetingControls` update; `localStream` tracks reflect the state.
3.  **Screen Sharing**: User clicks "Share Screen".
    *   *Action*: `handleScreen()` triggers `toggleScreenShare()`.
    *   *Verification*: Local preview shows screen; `sender.replaceTrack()` updates remote peers.
4.  **Communication**: User opens Chat drawer and sends a message.
    *   *Action*: `handleSendMessage()` emits `chat-message`.
    *   *Verification*: Message appears in local and remote chat logs with timestamp.

---

## 🔴 Workflow 5: Meeting Termination
**Goal**: Gracefully exit the call and clean up resources.

### Steps
1.  **Leave**: User clicks "End Call" (Red button).
    *   *Action*: `handleEndCall()` redirects user to `/`.
2.  **Cleanup**: `useEffect` cleanup in `useWebRTC` triggers.
    *   *Action*: `localStream.stop()`, `socket.disconnect()`, and peer connections closed.
    *   *Verification*: Camera light turns off; socket connection is terminated.

---

## 🛠️ Verification Protocol (Checkpoints)

| Phase | Checkpoint | Command/Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **Auth** | Login Flow | Manual Test | Redirect to `/home` |
| **Lobby** | Media Perms | Refresh `/room-id` | Permission prompt + Video Preview |
| **Call** | Peer Join | Open 2 tabs | Two video tiles visible |
| **Share** | Screen Share | Click Share | Screen visible in both tabs |
| **Chat** | Msg Delivery | Type "Hello" | Message visible in both tabs |
| **Exit** | Resource Cleanup | Click End Call | Redirect to `/` + Cam light OFF |
