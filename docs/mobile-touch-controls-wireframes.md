# Mobile & Tablet Touch Controls - Wireframes

## Ama Treasure Adventure - Visual Design Specifications

**Designer:** Sally (UX Designer)  
**Date:** November 22, 2025  
**Target:** Kids (ages 6-12) on tablets and mobile devices

---

## Wireframe 1: Single Player Mobile (< 768px)

```
┌─────────────────────────────────────────┐
│  ⏳ Time: 40  🏆 Level: 1  ⭐ High: 0 │ ← Top Stats Bar
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  │      🎮 GAME AREA               │   │
│  │      (Character, Treasures,     │   │
│  │       Obstacles)                │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────┐                   │
│  │                 │                   │
│  │      ⬆️          │                   │
│  │                 │                   │
│  │  ⬅️    ⬇️    ➡️  │  ← D-Pad (P1)    │
│  │                 │     Bottom-Left   │
│  └─────────────────┘                   │
│                                         │
│  [⏸ PAUSE]  [🏠 EXIT]                  │ ← Action Buttons
└─────────────────────────────────────────┘
```

### Specifications:

- **D-Pad Position:** Bottom-left corner, 20px from edges
- **D-Pad Size:** 60px diameter per button
- **D-Pad Layout:** Cross pattern (↑ center-top, ↓ center-bottom, ← left, → right)
- **Gap Between Buttons:** 8px
- **Container Background:** rgba(0, 0, 0, 0.6) with 20px border-radius
- **Z-Index:** 100 (above game area)

---

## Wireframe 2: Two Player Tablet (≥ 768px, Landscape)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⏳ Time: 40  🏆 Level: 1  ⭐ High: 0  🎵                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │              🎮 GAME AREA                                   │   │
│  │              (Both Players Visible)                        │   │
│  │                                                             │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐              ┌──────────────┐                    │
│  │   P1         │              │   P2         │                    │
│  │              │              │              │                    │
│  │     ⬆️       │              │     ⬆️       │                    │
│  │              │              │              │                    │
│  │  ⬅️  ⬇️  ➡️  │              │  ⬅️  ⬇️  ➡️  │                    │
│  │              │              │              │                    │
│  └──────────────┘              └──────────────┘                    │
│  D-Pad (P1)                    D-Pad (P2)                          │
│  Bottom-Left                   Bottom-Right                        │
│  Blue Theme                     Green Theme                         │
│                                                                     │
│  [⏸ PAUSE]  [🏠 EXIT]                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Specifications:

- **Player 1 D-Pad:** Bottom-left, 20px from left edge, 20px from bottom
- **Player 2 D-Pad:** Bottom-right, 20px from right edge, 20px from bottom
- **D-Pad Size:** 80px diameter per button (larger for tablet)
- **Color Coding:**
  - P1: Blue theme (rgba(100, 150, 255, 0.8))
  - P2: Green theme (rgba(100, 255, 150, 0.8))
- **Labels:** "P1" and "P2" above each D-pad (16px font, bold)

---

## Wireframe 3: Single Player Tablet (≥ 768px, Portrait)

```
┌─────────────────────────────┐
│  ⏳ Time: 40  🏆 Level: 1   │
│  ⭐ High: 0  🎵              │
│                             │
│  ┌───────────────────────┐   │
│  │                       │   │
│  │                       │   │
│  │   🎮 GAME AREA        │   │
│  │                       │   │
│  │                       │   │
│  │                       │   │
│  └───────────────────────┘   │
│                             │
│  ┌───────────────────────┐   │
│  │                       │   │
│  │         ⬆️            │   │
│  │                       │   │
│  │    ⬅️    ⬇️    ➡️      │   │
│  │                       │   │
│  └───────────────────────┘   │
│      D-Pad (Centered)         │
│      Bottom Center            │
│                             │
│  [⏸ PAUSE]  [🏠 EXIT]      │
└─────────────────────────────┘
```

### Specifications:

- **D-Pad Position:** Centered horizontally, 20px from bottom
- **D-Pad Size:** 90px diameter per button (largest for tablet comfort)
- **Layout:** Same cross pattern, larger touch targets

---

## Wireframe 4: D-Pad Button States

### Default State

```
┌─────┐
│  ⬆️  │  ← White/light icon
└─────┘
Background: rgba(255, 255, 255, 0.2)
Border: 3px solid rgba(255, 255, 255, 0.5)
Size: 60-90px diameter
```

### Pressed State

```
┌─────┐
│  ⬆️  │  ← Orange icon, slightly smaller
└─────┘
Background: rgba(255, 165, 0, 0.8)
Border: 3px solid rgba(255, 165, 0, 1)
Scale: 0.9 (visual feedback)
Opacity: 100%
```

### Active State (Continuous Press)

```
┌─────┐
│  ⬆️  │  ← Bright orange, glowing
└─────┘
Background: rgba(255, 165, 0, 1)
Border: 3px solid rgba(255, 165, 0, 1)
Box Shadow: 0 0 20px rgba(255, 165, 0, 0.8)
Scale: 1.0
```

---

## Wireframe 5: Control Toggle (Mobile Two-Player)

```
┌─────────────────────────────────────────┐
│  ⏳ Time: 40  🏆 Level: 1  ⭐ High: 0   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      🎮 GAME AREA               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────┐                   │
│  │      ⬆️          │                   │
│  │  ⬅️    ⬇️    ➡️  │  ← D-Pad          │
│  └─────────────────┘                   │
│                                         │
│  [👤 P1] [👤 P2]  ← Player Toggle       │
│    ↑ Active                              │
│                                         │
│  [⏸ PAUSE]  [🏠 EXIT]                  │
└─────────────────────────────────────────┘
```

### Specifications:

- **Toggle Buttons:** Above D-pad, centered
- **Active Player:** Highlighted (orange background)
- **Inactive Player:** Dimmed (gray background)
- **Size:** 80px wide x 40px tall
- **Function:** Switches which player the D-pad controls

---

## Wireframe 6: Touch-to-Move Option (Settings)

```
┌─────────────────────────────────────────┐
│  ⏳ Time: 40  🏆 Level: 1  ⭐ High: 0   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      🎮 GAME AREA               │   │
│  │      (Tap anywhere to move)     │   │
│  │                                 │   │
│  │      👤 → 🎯                    │   │
│  │      (Character moves to tap)    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [⚙️ Settings]  [⏸ PAUSE]  [🏠 EXIT]   │
└─────────────────────────────────────────┘
```

### Specifications:

- **Visual Indicator:** Shows target destination with crosshair (🎯)
- **Movement Path:** Optional visual trail
- **Settings Toggle:** Enable/disable touch-to-move
- **Default:** Disabled (D-pad preferred for kids)

---

## Component Specifications

### D-Pad Container

```
┌─────────────────────────┐
│  (Optional: Player Label)│
│                         │
│      ┌─────┐            │
│      │  ⬆️  │            │
│      └─────┘            │
│                         │
│  ┌─────┐  ┌─────┐      │
│  │  ⬅️  │  │  ➡️  │      │
│  └─────┘  └─────┘      │
│                         │
│      ┌─────┐            │
│      │  ⬇️  │            │
│      └─────┘            │
│                         │
└─────────────────────────┘
```

**CSS Specifications:**

- Container: `display: flex`, `flex-direction: column`, `align-items: center`
- Background: `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(10px)`
- Padding: `15px`
- Border Radius: `20px`
- Position: `fixed`, `bottom: 20px`
- Z-Index: `100`

### Individual Button

```css
.dpad-button {
  width: 60px; /* Mobile */
  height: 60px; /* Mobile */
  width: 80px; /* Tablet */
  height: 80px; /* Tablet */
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px; /* Mobile */
  font-size: 28px; /* Tablet */
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: all 0.1s ease;
}

.dpad-button:active {
  background: rgba(255, 165, 0, 0.8);
  transform: scale(0.9);
  border-color: rgba(255, 165, 0, 1);
}
```

---

## Responsive Breakpoints

### Mobile (< 768px)

- Single D-pad, bottom-left
- 60px button diameter
- Player toggle for two-player mode
- Compact layout

### Tablet (≥ 768px)

- **Portrait:** Centered D-pad, 90px buttons
- **Landscape:** Split-screen D-pads for two-player, 80px buttons
- More spacing, larger touch targets

### Desktop (> 1024px)

- Touch controls hidden (keyboard only)
- Existing keyboard controls remain

---

## Accessibility Features

### Visual

- High contrast colors (white on dark background)
- Large touch targets (minimum 48px, recommended 60px+)
- Clear visual feedback on press
- Color coding for two-player (blue/green)

### Interaction

- `touch-action: manipulation` prevents scrolling
- `user-select: none` prevents text selection
- Immediate visual feedback (< 100ms)
- Haptic feedback (vibration API) if available

### Screen Reader Support

- ARIA labels: "Move up", "Move down", "Move left", "Move right"
- Role: "button"
- State: "pressed" when active

---

## Implementation Notes

### Touch Event Mapping

```
Touch Start → Add direction to keysPressed Set
Touch End → Remove direction from keysPressed Set
Touch Cancel → Remove direction from keysPressed Set
Touch Move → (Optional) Detect swipe direction
```

### Integration Points

- Use existing `keysPressed` Set system
- Hook into `processMovement()` function
- Maintain compatibility with keyboard controls
- Detect device type to show/hide controls

### Performance

- Use CSS transforms for animations (GPU accelerated)
- Debounce touch events if needed
- Minimize DOM manipulation
- Cache button elements

---

## Next Steps for Implementation

1. ✅ **Analysis Complete**
2. ✅ **Wireframes Complete**
3. ⏭️ **Create HTML Structure** - D-pad containers and buttons
4. ⏭️ **Add CSS Styling** - Responsive, kid-friendly styles
5. ⏭️ **Implement JavaScript** - Touch event handlers
6. ⏭️ **Test on Devices** - Real mobile/tablet testing
7. ⏭️ **User Testing** - With target age group
8. ⏭️ **Iterate** - Refine based on feedback

---

## Conclusion

These wireframes provide a complete visual specification for implementing touch controls that are:

- ✅ Kid-friendly (large targets, clear feedback)
- ✅ Responsive (adapts to screen size)
- ✅ Accessible (high contrast, clear labels)
- ✅ Functional (works with existing codebase)
- ✅ Fun (engaging visual design)

The design prioritizes ease of use for children while maintaining the game's core gameplay experience.
