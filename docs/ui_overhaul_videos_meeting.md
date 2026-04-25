# Plan: Professional & Themeable UI for VideosMeeting

This plan outlines the UI overhaul for the `VideosMeeting.jsx` component. The goal is to create a professional, responsive video conferencing interface using Material UI (MUI) while ensuring the design is theme-agnostic (supports both Light and Dark modes seamlessly).

## Objective
- Redesign the Lobby and Meeting Room interfaces.
- Implement a responsive video grid for multiple participants.
- Add a floating, professional control bar (Mute, Video, Screen Share, Chat, End Call).
- Ensure the UI is polished and consistent with modern video conferencing tools (Zoom/Google Meet).
- Keep the existing WebRTC and Socket.io logic intact.

## Proposed Design System
- **Layout Pattern:** Grid-centric (Meeting) / Centered Hero (Lobby).
- **Style:** Minimalist Professional with subtle glassmorphism (where appropriate).
- **Color Palette:**
  - **Primary:** Deep Blue/Indigo (consistent with MUI defaults).
  - **Background:** Slate-900 (Dark) / Gray-50 (Light).
  - **Surface:** Slate-800 (Dark) / White (Light) with subtle borders.
- **Typography:** Inter/Roboto (MUI defaults).

## Implementation Steps

### Phase 1: Context & Theming Setup
1. **Check for Theme Provider:** Verify if a global `ThemeProvider` exists in `App.jsx` or `main.jsx`.
2. **Local Theme Toggle:** If no global theme is found, implement a local theme state.

### Phase 2: Lobby Redesign
1. **Lobby Container:** A centered card/container with a professional "Enter into the Lobby" header.
2. **Local Preview:** A larger, rounded video element with a "Mute/Video" quick-toggle overlay.
3. **Join Controls:** Styled `TextField` and `Button` from MUI.

### Phase 3: Meeting Room Redesign
1. **Main Container:** Full-screen layout with a responsive video grid.
2. **Video Grid Logic:**
   - 1-2 participants: Side-by-side or stacked (large).
   - 3+ participants: Grid layout.
3. **Video Item:** Rounded corners, name overlay (socket ID for now), and status icons.
4. **Floating Control Bar:**
   - Bottom-centered, rounded bar.
   - Icons: `Mic`, `Videocam`, `ScreenShare`, `Chat`, `CallEnd` (Red).
   - Tooltips for each action.

### Phase 4: Styling Updates (`VideosMeeting.css`)
1. Remove generic `*` selectors that reset background/color globally.
2. Add scoped classes for the meeting container, video grid, and control bar.
3. Implement CSS variables for colors to support theme switching.

### Phase 5: Refactoring `VideosMeeting.jsx`
1. Replace the existing `return` block with the new structured JSX.
2. Integrate MUI components (`IconButton`, `Badge`, `Stack`, `Container`, `Tooltip`, `Paper`).
3. Add state/functions for UI toggles (Mute, Stop Video, Open Chat).

## Verification & Testing
1. **Theme Toggle:** Manually switch themes and verify contrast and visibility.
2. **Responsive Grid:** Test with simulated multiple "participants" (by opening multiple tabs).
3. **Local Media Toggles:** Ensure the "Mute" and "Stop Video" buttons actually stop the tracks and update the UI.
4. **Mobile Layout:** Verify the video grid stacks correctly on small screens.
