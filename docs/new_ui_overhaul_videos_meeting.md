# Plan: UI Overhaul for VideosMeeting.jsx

## Objective
Transform the current basic WebRTC meeting interface into a professional, modern, and user-friendly experience using Material UI (MUI). The overhaul will include a cohesive Lobby experience, a responsive meeting grid, a floating control bar, and a theme system supporting both Light and Dark modes.

## Key Files & Context
- `FocusRoom/pages/VideosMeeting.jsx`: Main meeting logic and UI.
- `FocusRoom/styles/VideosMeeting.css`: Existing styles (to be largely replaced or integrated with MUI).
- `FocusRoom/src/App.jsx`: Entry point to add `ThemeProvider`.
- `FocusRoom/package.json`: Dependency management.

## Implementation Steps

### 1. Theme and Global Setup
- [ ] **Install `@mui/icons-material`**: Essential for meeting controls (Mic, Cam, etc.).
- [ ] **Create Theme Provider**:
    - Wrap `App.jsx` with MUI `ThemeProvider`.
    - Implement a `ColorModeContext` to allow toggling between Light and Dark modes.
    - Define a custom theme with modern typography (Inter/Roboto) and a sophisticated color palette.

### 2. Refactor VideosMeeting Structure
- [ ] **State Organization**: Better organize media and connection states.
- [ ] **Conditional Rendering**: Clearly separate the `Lobby` view and the `MeetingRoom` view using MUI components.

### 3. Lobby UI Overhaul
- [ ] **Lobby Card**: A centered `Paper` component containing:
    - **Video Preview**: A styled `Box` with the local video stream.
    - **Media Toggles**: Integrated Mic/Camera toggles on the video preview.
    - **Identity Input**: `TextField` for the username.
    - **Join Action**: A prominent "Join Meeting" button.
- [ ] **Background**: A clean, slightly animated background (or simple gradient) to set the mood.

### 4. Meeting Room UI Overhaul
- [ ] **Top Bar**: `AppBar` showing room name/URL, duration, and participant count.
- [ ] **Video Grid**:
    - Use MUI `Grid` or `Box` with `display: grid`.
    - Dynamic sizing based on the number of participants.
    - **Participant Tiles**: `Paper` cards with the video, name tag, and status icons (muted/camera-off).
- [ ] **Floating Control Bar**:
    - Positioned at the bottom center.
    - Glassmorphism style (blur + semi-transparent background).
    - Buttons: Mute, Stop Video, Share Screen, Chat, Participants, End Call (Red).
- [ ] **Sidebar (Drawer)**:
    - Right-aligned `Drawer` for Chat and Participants list.
    - Tabbed interface to switch between Chat and People.

### 5. Interaction & Feedback
- [ ] **MUI Alerts/Snackbars**: For notifications (e.g., "User joined", "Permission denied").
- [ ] **Smooth Transitions**: Use MUI `Fade` or `Grow` components for UI elements appearing/disappearing.
- [ ] **Responsive Design**: Ensure the grid and control bar adapt to mobile screens.

## Verification & Testing
- [ ] **Functional Test**: Verify WebRTC signaling and stream exchange still work correctly.
- [ ] **Theme Test**: Toggle between Light and Dark modes and ensure all components adapt correctly.
- [ ] **Responsive Test**: Check layout on desktop, tablet, and mobile breakpoints.
- [ ] **Edge Cases**: Handle "No Camera/Mic" scenarios gracefully with placeholders.
