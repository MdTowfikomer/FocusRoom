# Responsive Modern Video Conferencing UI (Mesh/P2P)

This document outlines the UI design and layout strategy for a modern, Google Meet-inspired video conferencing interface, optimized for a **peer-to-peer (mesh)** architecture. Given the mesh architecture, the UI is designed to handle up to **4 participants** (1 local + 3 remote) to ensure performance and stability.

---

## 🎨 Design Philosophy
- **Modern & Minimalist**: Clean layout with rounded corners and subtle shadows.
- **Consistency**: High-quality icons and a unified theme across all states.
- **Responsiveness**: Fluid grid system that adapts based on the number of participants.
- **Glassmorphism**: Use of blurs and transparency for controls and overlays.

---

## 📱 Layout Strategies per Participant Count

The layout dynamically adapts to provide the best viewing experience for various participant counts.

### 1. Two Participants (1 Remote + 1 Local)
Inspired by the "Self-view overlay" pattern.
- **Primary View**: The remote participant's video occupies the full screen background.
- **Secondary View (Self)**: A small, high-quality floating tile (PIP) positioned in the bottom-right corner.
- **Spacing**: Minimal padding to maximize immersion.

### 2. Three Participants (2 Remote + 1 Local)
Inspired by the "Balanced Stack" pattern.
- **Top Row**: Two equal-sized tiles for the remote participants side-by-side.
- **Bottom Row**: The local participant's tile centered below them, creating a pyramid effect.
- **Visual Weight**: Equal size for all three tiles to maintain a balanced look.

### 3. Four Participants (3 Remote + 1 Local)
The classic "Balanced Quad" layout.
- **Grid Structure**: A clean 2x2 grid.
- **Symmetry**: All four tiles are of equal size, providing equal importance to every participant.
- **Efficiency**: Optimal for mesh architecture, ensuring visibility of all feeds without clutter.

---

## 🛠 Feature & Icon Specification

To maintain a premium feel, keep icons consistent with the current theme:

| Feature | Icon | Action |
| :--- | :--- | :--- |
| **Microphone** | `Mic` / `MicOff` | Toggle audio feed |
| **Camera** | `Videocam` / `VideocamOff` | Toggle video feed |
| **Hand** | `FrontHand` | Raise hand for attention |
| **Menu** | `MoreVert` | More settings/options |
| **End Call** | `CallEnd` | Terminate connection |

---

## 🚀 Optimization for Mesh Architecture
- **Bandwidth**: Mesh performance drops as N increases. Limiting to 4 keeps everyone's upload/download within reasonable limits.
- **Local Mirroring**: Always mirror the local stream (`transform: scaleX(-1)`) to feel natural for the user.
- **Placeholders**: If a video feed drops or is disabled, use a high-quality initials-based avatar with a brand-consistent background color.

---
*Created with focus on premium UX and consistent visual identity.*
