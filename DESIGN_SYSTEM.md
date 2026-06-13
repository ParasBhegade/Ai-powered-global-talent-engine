# AI Talent Engine — Neural Archive + Kinetic Alabaster Design System

This document outlines the architecture used across the AI Talent Engine.

## 🎨 Color Palette

### 🌙 Dark Mode (Obsidian Kinetic)
| Token | HEX / Value | Purpose |
| :--- | :--- | :--- |
| `--surface` | `#0d0e11` | Main background |
| `--surface-container` | `#171a1e` | Glass card backgrounds |
| `--surface-container-highest` | `#22262d` | Elevated elements |
| `--primary` | `#c6c6c7` | Brand color |
| `--secondary` | `#9c9da8` | Secondary elements |
| `--tertiary` | `#eaf2f9` | Highlights |
| `--on-surface` | `#e2e5ef` | Primary text |
| `--on-surface-variant`| `#a7abb4` | Muted / Subtitle text |
| `--outline-variant` | `rgba(68, 72, 80, 0.15)` | Ghost borders |

### ☀️ Light Mode (Kinetic Alabaster)
| Token | HEX / Value | Purpose |
| :--- | :--- | :--- |
| `--surface` | `#f9f9fb` | Main background |
| `--surface-container` | `#eeeef0` | Glass card backgrounds |
| `--surface-container-highest` | `#e2e2e4` | Elevated elements |
| `--primary` | `#000000` | Brand color |
| `--secondary` | `#5a5f66` | Secondary elements |
| `--tertiary` | `#000000` | Highlights |
| `--on-surface` | `#1a1c1d` | Primary text |
| `--on-surface-variant`| `#46464a` | Muted / Subtitle text |
| `--outline-variant` | `rgba(199, 198, 202, 0.15)` | Ghost borders |

---

## 📐 Layout & Components

### Layout Grids
- **`.dashboard-layout`**: Grid template (260px 1fr) for sidebar + main content.
- **`.two-col`**: Grid template (1fr 400px) for dual-column focus areas.
- **`.bento-grid`**: CSS Grid utility (12 columns) for standard bento layouts.
- **`.features-grid`**: Flex-wrap utility that centers items (used on Landing Page).

### Component Classes
- **`.glass-card`**: The primary container for information. 12px border-radius, no border, subtle hover elevation.
- **`.ghost-border`**: 1px tonal borders (`var(--outline-variant)`) instead of heavy shadows.
- **`.auth-card`**: 24px border-radius, `var(--surface-container)` background.
- **`.app-navbar`**: Sticky navbar with backdrop-blur.

### Interactive Tokens
- **Primary Gradient**: `linear-gradient(135deg, var(--primary), var(--primary-dim))`
- **Border Radius**: 
    - Auth Cards: `24px`
    - Glass Cards / Sidebar / Nav: `12px`
    - Inputs / Small Buttons: `8px` or `2px` for bottom-border inputs.

---

## ✍️ Typography
- **Primary Headings**: `Plus Jakarta Sans` or `Manrope` (Weight: 600/800)
- **Body**: `Inter` (Weight: 400/600/700)
- **Letter Spacing**: `-0.02em` on headers for a modern, compact look.

## 🖼️ Icons / Assets
Assets are stored in `/public/icons/` and include general application icons.
