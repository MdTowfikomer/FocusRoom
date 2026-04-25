# Frontend Refactoring Guide: Modular WebRTC & Sockets

## 🎯 The Goal: Separation of Concerns
Currently, `VideosMeeting.jsx` is a "God Component"—it handles UI, Sockets, and WebRTC logic all in one place. This makes it hard to debug and unstable. We will break this down into three distinct layers:

1.  **Transport Layer (`useSocket.js`)**: Manages the connection to the signaling server.
2.  **Logic Layer (`useWebRTC.js`)**: Manages PeerConnections, SDP exchange, and ICE candidates.
3.  **UI Layer (`VideosMeeting.jsx`)**: Renders the views based on the state provided by the hooks.

---

## 📂 Proposed Directory Structure
```text
FocusRoom/
├── hooks/
│   ├── useSocket.js      # Socket.io lifecycle
│   └── useWebRTC.js      # WebRTC signaling & Stream management
├── pages/
│   └── VideosMeeting.jsx # Clean UI entry point
└── components/           # (Already existing)
```

---

## 🛠 Phase 1: The Socket Hook (`useSocket.js`)
This hook will handle the connection to the server and provide a stable `socket` instance to the rest of the app.

**Why?** If you refresh the UI or a component re-renders, you don't want to accidentally create multiple socket connections.

### Implementation Logic:
*   Use `useRef` to store the socket instance.
*   Provide a `connect` and `disconnect` method.
*   Expose an `emit` function to simplify sending messages.

---

## 🛠 Phase 2: The WebRTC Hook (`useWebRTC.js`)
This is the "Brain" of your meeting. It will handle the complex logic of connecting participants.

### Key Responsibilities:
1.  **Connection Mapping**: Storing `RTCPeerConnection` objects for every participant.
2.  **Signaling**: Handling `offer`, `answer`, and `ice-candidate` events.
3.  **Stream Handling**: Managing the `localStream` and receiving `remoteStreams`.

### 🚀 Stability Fix: "Perfect Negotiation"
To fix the issue where some participants only see the host, we implement **Perfect Negotiation**. 
*   **Logic**: One peer is designated as "Polite" and the other as "Impolite" based on their Socket IDs. 
*   If both try to connect at the same time, the "Polite" peer backs off and lets the other finish. This eliminates the race conditions you saw with 5+ members.

---

## 🛠 Phase 3: The Refactored `VideosMeeting.jsx`
After refactoring, your main component should look like a "Controller" that simply pipes data from hooks into components.

```javascript
export default function VideosMeeting() {
  const { localStream, remoteVideos, sendMessage, messages } = useWebRTC(username);

  return (
    <MeetingWrapper>
       <VideoGrid videos={remoteVideos} localStream={localStream} />
       <ChatDrawer messages={messages} onSend={sendMessage} />
       <MeetingControls />
    </MeetingWrapper>
  );
}
```

---

## 🧠 Deep Understanding: Why this makes you a better developer

### 1. Testability
By moving WebRTC logic into a hook, you can eventually write tests for the logic without needing to render the entire MUI interface.

### 2. Debugging "Visibility"
When a bug happens, you can now ask:
*   "Is the message not sending?" -> Check `useSocket.js`.
*   "Is the video frozen?" -> Check `useWebRTC.js`.
*   "Is the button not clicking?" -> Check `VideosMeeting.jsx`.

### 3. Reusability
If you decide to build a "Small Group Chat" feature later in a different part of the app, you can simply import `useWebRTC` and `useSocket` again. You don't have to copy-paste 400 lines of UI code.

---

## 📝 Action Plan for You

1.  **Create the `hooks` folder** in your `FocusRoom` directory.
2.  **Extract the Socket logic**: Move the `io(server_url)` and socket event listeners into `useSocket.js`.
3.  **Extract WebRTC logic**: Move the `RTCPeerConnection` creation and signaling (`sdp`, `ice`) into `useWebRTC.js`.
4.  **Simplify the Page**: Remove all the `useRef` and signaling logic from `VideosMeeting.jsx` and replace them with calls to your new hooks.

**Would you like me to generate the code for these two new hooks to get you started?**
