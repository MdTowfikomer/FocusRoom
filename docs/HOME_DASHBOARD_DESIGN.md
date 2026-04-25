# FocusRoom Home Dashboard: UI/UX & Interaction Design

## 1. Aesthetic Direction: **Pragmatic Glass-OS**
A high-efficiency, high-craft dashboard that blends industrial utility with luxury minimalism. It feels like a futuristic operating system dedicated to communication.

*   **DFII Score**: 15 (Excellent)
*   **Key Inspiration**: High-end command centers, modern flight decks, and premium productivity OS.

---

## 2. Design System Snapshot

### Typography
*   **Display**: *Plus Jakarta Sans* (Bold/ExtraBold) - For headings and prominent numbers. Friendly yet authoritative.
*   **Body/UI**: *Plus Jakarta Sans* (Regular/Medium) - For descriptions and labels.
*   **Monospace Mono-Accent**: *Space Mono* - For technical metadata (e.g., Session IDs, timestamps), maintaining consistency with the meeting interface.

### Color Palette (CSS Variables)
```css
:root {
  --bg-default: #0A0F1E;        /* Deep space blue */
  --surface-glass: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --primary-glow: #3B82F6;      /* Trust Blue */
  --accent-action: #F97316;     /* Kinetic Orange for CTAs */
  --text-primary: #F8FAFC;      /* Ghost White */
  --text-secondary: #94A3B8;    /* Slate Gray */
  --status-active: #10B981;     /* Emerald Green */
}
```

### Spatial Rhythm
*   **Grid**: 12-column responsive layout.
*   **Composition**: Asymmetrical balance. A large "Primary Nexus" on the left for main actions, and a "Recent/Scheduled" sidebar on the right.
*   **Density**: High-efficiency but clear. Actions are large and reachable.

---

## 3. Interaction Design & User Journeys

### The "Quick Action Nexus"
The core of the Home page. A grid of 3 primary tiles:
1.  **START_NEW**: Instant meeting creation. Glows on hover.
2.  **JOIN_MEETING**: Opens an inline input field (no modal redirection).
3.  **SCHEDULE**: (Future-proof placeholder) Opens a calendar integration view.

### Micro-Interactions
*   **Hover Parallax**: Tiles slightly tilt and glow based on mouse position.
*   **Stateful Buttons**: "Join" button transforms into a loading state immediately upon click (`active:scale-95`).
*   **Success Haptics**: Subtle border flash (Green) when a meeting ID is copied to the clipboard.

---

## 4. UI Structure (Wireframe Concept)

### A. Global Header (Floating)
*   Logo (Left)
*   User Profile + Quick Toggle (Light/Dark) (Right)

### B. Hero Section (Welcome)
*   "WELCOME, [USER]" in monospace font.
*   Large time/date display (Industrial aesthetics).

### C. Main Dashboard Area
*   **Left Column (Nexus)**:
    *   `Card`: "Start Instant Meeting" (High contrast, orange accent).
    *   `Card`: "Join with ID" (Large input + Join button).
*   **Right Column (Activity)**:
    *   `List`: "Recent Sessions" (Scrollable list of past room IDs).
    *   `Status`: Current connection health indicator.

---

## 5. Differentiation Callout
> "This avoids generic SaaS UI by treating the dashboard as a **Functional Workspace** rather than a marketing page. We use **Industrial Mono-accents** and **Glassmorphism Depth** to make the user feel like they are entering a high-performance 'Focus Environment', moving away from the typical 'white-background-purple-button' template."

---

## 6. Implementation Plan (Atomic Steps)
1.  [ ] **Theme Update**: Extend MUI theme with `Plus Jakarta Sans` and custom `rgba` surface colors.
2.  [ ] **Layout Scaffold**: Implement `DashboardLayout` component with sidebar/main split.
3.  [ ] **Nexus Component**: Build the primary interaction tiles with Framer Motion hover effects.
4.  [ ] **Join Logic Integration**: Connect the "Join" input to the `react-router` navigation.
5.  [ ] **Recent History Mock**: Add a placeholder for meeting history stored in local storage or MongoDB.
