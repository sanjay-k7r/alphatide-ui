# Sidebar Implementation

## File to Create

- `components/left-sidebar.tsx` (new file, do not modify `app-sidebar-reference-only.tsx`)

## Layout Structure

```
┌─────────────────────┐
│ [Icon] Alphatide    │  Header
├─────────────────────┤
│ Chat                │  Navigation
│ Radar               │
│                     │
│                     │
│                     │
├─────────────────────┤
│ Settings            │  Footer
│                     │
│ SK kashalkar@gmail.com │
│                      │
└─────────────────────┘
```

## Requirements

1. **Tech Stack**: Use shadcn sidebar components
2. **Navigation**: Client-side routing (no full page reloads)
   - Follow pattern from current chat/radar header buttons
   - Smooth content area transitions
3. **User Info**: Display email from auth context
4. **Settings**:

- opens (/settings)
  - Theme selector (Dark/Light/System)
  - Debug mode toggle (On/Off)

5. **Reference**: Review [app-sidebar-reference-only.tsx](components/app-sidebar-reference-only.tsx) for structure only

## Navigation Items

- Chat (default/home)
- Radar (dashboard view)
- Settings (/settings)
- show vertical elipsis after user email which shows an option to logout
