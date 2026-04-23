# Obsidian Ledger — Design System

This document outlines the professional **Midnight Bento** architecture used across the Talent Intelligence System.

## 🎨 Color Palette

### 🌙 Dark Mode (Midnight)
| Token | HEX / Value | Purpose |
| :--- | :--- | :--- |
| `--surface` | `#060e20` | Main background |
| `--surface-container` | `#0f1930` | Bento box backgrounds |
| `--primary` | `#a3a6ff` | Brand color (Indigo Glow) |
| `--secondary` | `#69f6b8` | Success / Trend lines (Mint) |
| `--tertiary` | `#919bff` | Highlights |
| `--on-surface` | `#dee5ff` | Primary text |
| `--on-surface-variant`| `#a3aac4` | Muted / Subtitle text |

### ☀️ Light Mode (Industrial)
| Token | HEX / Value | Purpose |
| :--- | :--- | :--- |
| `--surface` | `#F9F9FF` | Main background |
| `--surface-container` | `#FFFFFF` | Bento box backgrounds |
| `--primary` | `#4648D4` | Brand color (Deep Indigo) |
| `--secondary` | `#006C49` | Success / Emerald accents |
| `--on-surface` | `#111C2D` | Primary text |
| `--on-surface-variant`| `#4B5563` | Muted / Subtitle text |

---

## 📐 Layout & Components

### Bento Grid
The system uses a 12-column grid or flexible bento layouts:
- **`.glass-card`**: The primary container for information. High border-radius (24px) and subtle depth.
- **`.ghost-border`**: 1px tonal borders (`rgba(64, 72, 93, 0.15)`) instead of heavy shadows.
- **`.bento-grid`**: CSS Grid utility for standard layouts.
- **`.features-grid`**: Flex-wrap utility that centers items (used on Landing Page).

### Interactive Tokens
- **Primary Gradient**: `linear-gradient(135deg, var(--primary), var(--primary-dim))`
- **Border Radius**: 
    - Full Cards: `24px`
    - Small Buttons/Tags: `12px`
    - Logic/Progress Bars: `4px`

---

## ✍️ Typography
- **Headings**: `Manrope` or `Plus Jakarta Sans` (Weight: 800)
- **Body**: `Inter` (Weight: 400/600)
- **Letter Spacing**: `-0.02em` on headers for a modern, compact look.

## 🖼️ Icons / Assets
Assets are stored in `/public/icons/` and include:
- `sparkle.png`: General AI / Feature highlight
- `back.png`: Navigation
- `audio.png`: TTS / Voice interfaces
