# Refactoring Guide: Swapping Logic in `VideosMeeting.jsx`

This document outlines the steps to replace the "God Component" logic in `VideosMeeting.jsx` with your new modular hooks: `useSocket.js` and `useWebRTC.js`.

## 1. Cleanup: What to Delete 🗑️

Remove these "heavy" logic pieces from the top of your file and inside the component:

*   **Imports**: Delete `import { io } from "socket.io-client";`.
*   **Global Variables**: Delete `server_url`, `connections`, and `peerConnectionConfig`.
*   **Refs**: Delete `socketRef`, `socketIdRef`, and `mediaRequestInProgress`.
*   **State**: Delete `videos`, `messages`, and `localStream` (these now live in the hook).
*   **Functions**: 
    *   Delete `getPermission`.
    *   Delete `connectToSocketServer` (all 80+ lines of it!).
    *   Delete the `useEffect` that calls `getPermission`.

---

## 2. Integration: What to Add 🧩

### Hook Initialization
At the very top of your `VideosMeeting` component, call your new hook:

```javascript
const {
  localStream,
  remoteVideos,
  messages,
  sendMessage: sendChatMessage, // Rename to avoid collision with your local state
  toggleAudio,
  toggleVideo,
  startMeeting,
  participantCount
} = useWebRTC();
```

### Action Handlers
Update your handler functions to pipe data into the hook:

*   **Join Logic**:
    ```javascript
    const handleJoin = () => {
      setAskForUsername(false);
      startMeeting(username); // This handles media + socket + signaling
    };
    ```

*   **Message Logic**:
    ```javascript
    const handleSendMessage = () => {
      if (message.trim()) {
        sendChatMessage(username, message);
        setMessage("");
      }
    };
    ```

---

## 3. UI Update: Connecting the Pipes 📺

### Video Grid
Update the `DynamicGrid` section. Ensure you are mapping over the correct array:

```javascript
// Before: videos.map(...)
// After:
{remoteVideos.map((v) => (
  <VideoTile
    key={v.id}
    username={`PEER_${v.id.substring(0, 4).toUpperCase()}`}
    stream={v.stream}
  />
))}
```

### Chat Drawer
The `messages` array now comes from the hook. Ensure your map remains the same but uses the new source.

### Controls
Update `MeetingControls` to use the hook's toggle functions:

```javascript
<MeetingControls
  isMuted={!audioEnabled}
  onToggleMute={() => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    toggleAudio(nextState); // Tell the hook/WebRTC
  }}
  isVideoOff={!videoEnabled}
  onToggleVideo={() => {
    const nextState = !videoEnabled;
    setVideoEnabled(nextState);
    toggleVideo(nextState); // Tell the hook/WebRTC
  }}
  // ... rest of props
/>
```

---

## 4. Verification Checklist ✅

1.  **Lobby**: Does the camera preview still work in the Lobby?
2.  **Connection**: When you click "Join", does the `on("connect")` fire in your console?
3.  **Peer-to-Peer**: Can you open two tabs and see each other?
4.  **Chat**: Does the message appear for both users?

**Proceed with these changes and let me know if you hit any import or scope errors!**
