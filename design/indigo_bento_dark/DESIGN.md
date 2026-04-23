# Design System Specification: The Midnight Bento

## 1. Overview & Creative North Star
**Creative North Star: "The Neon Nocturne"**

This design system is built for the "Digital Architect"—someone who requires maximum information density without sacrificing the soul of a high-end editorial publication. It moves beyond the typical "Bento Box" trend by embracing **Organic Precision**. We break the rigid, predictable grid through intentional asymmetry, overlapping modular containers, and a high-contrast hierarchy that guides the eye through complex data landscapes. 

Instead of a flat digital interface, we treat the screen as a physical workspace of stacked obsidian glass, illuminated by the radioactive glow of Indigo and Emerald accents.

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a deep slate abyss, using vibrant primary and secondary tones as light sources rather than mere decorations.

### Surface Hierarchy & Nesting
To achieve a premium feel, we prohibit the use of 1px solid borders for sectioning. Boundaries must be defined through **Tonal Layering**:
- **Base Layer:** `surface` (#060e20) – The foundation.
- **Sectioning:** Use `surface-container-low` (#091328) for large structural areas.
- **Primary Modules:** Use `surface-container` (#0f1930) or `surface-container-high` (#141f38) to pull content forward.
- **Actionable Elements:** `surface-container-highest` (#192540) creates the final "lift."

### The "Glass & Gradient" Rule
Standard flat buttons are insufficient for this identity. 
- **Signature CTAs:** Apply a subtle linear gradient from `primary` (#a3a6ff) to `primary-dim` (#6063ee) at 135 degrees.
- **Glassmorphism:** For floating menus or overlays, use `surface-bright` (#1f2b49) at 60% opacity with a `24px` backdrop-blur. This allows the "Emerald" (`secondary`) and "Indigo" (`primary`) glows from the content below to bleed through softly.

### Core Tokens
| Role | Hex Code | Usage |
| :--- | :--- | :--- |
| **Background** | `#060e20` | The deepest base layer. |
| **Primary (Indigo)** | `#a3a6ff` | Hero actions and brand-defining moments. |
| **Secondary (Emerald)** | `#69f6b8` | Success states, data visualizations, and highlights. |
| **Tertiary** | `#919bff` | Supporting accents and interactive metadata. |
| **Error** | `#ff6e84` | High-visibility alerts against the dark base. |

## 3. Typography: The Editorial Edge
We utilize a pairing of **Manrope** (Display/Headline) for its geometric, modern authority and **Inter** (Body/Label) for its peerless legibility in dense environments.

- **Display-LG (3.5rem):** Used for "Hero Numbers" within bento cells. Tighten letter-spacing (-0.02em).
- **Headline-SM (1.5rem):** The standard cell title. Always paired with a `secondary` (Emerald) icon or indicator.
- **Body-MD (0.875rem):** The workhorse. Use `on-surface-variant` (#a3aac4) for secondary body text to create a clear "read-order" hierarchy.
- **Label-SM (0.6875rem):** Micro-data and captions. All-caps with +0.05em tracking for a technical, "data-rich" feel.

## 4. Elevation & Depth: Atmospheric Layering
Traditional drop shadows look "muddy" on deep slate backgrounds. We use **Ambient Luminous Shadows**.

- **The Layering Principle:** If a card needs to pop, place a `surface-container-lowest` card (#000000) on top of a `surface-container-high` background. This creates "negative depth."
- **Luminous Shadows:** For floating elements, use a shadow with a 32px blur, 0px offset, and 6% opacity, using the `primary` (#a3a6ff) color instead of black. This creates a subtle "glow" rather than a shadow.
- **Ghost Borders:** If a boundary is strictly required for accessibility, use the `outline-variant` (#40485d) at **15% opacity**. Never use 100% opaque lines.

## 5. Components: Modular Precision

### Buttons & Chips
- **Primary Button:** Gradient fill (`primary` to `primary-dim`), `xl` (0.75rem) roundedness. Text is `on-primary` (deep navy).
- **Glass Chips:** `surface-variant` at 40% opacity with a `1px` Ghost Border. Used for tagging and filtering without adding visual clutter.

### Bento Modules (Cards)
- **Styling:** Forbid divider lines within cards. Use `vertical white space` (1.5rem / 24px) to separate header from content.
- **Interactivity:** On hover, a card should shift from `surface-container` to `surface-bright`. The `secondary` (Emerald) accent should glow brighter (increase opacity).

### Input Fields
- **Default State:** Background `surface-container-lowest`, no border, `sm` (0.125rem) roundedness for a sharper, more professional look.
- **Focus State:** `1px` solid `secondary` (Emerald) bottom-border only. This mimics a high-end analog dashboard.

### Data Visualization
- **Trend Lines:** Always use `secondary` (Emerald) for positive growth.
- **The "Bento Micro-Chart":** Sparklines should be embedded in the top right of cards, using `primary-dim` with a `20%` area fill gradient.

## 6. Do’s and Don’ts

### Do:
- **Do** use `secondary` (Emerald) sparingly as a "laser pointer" to guide the user to the most important data point.
- **Do** lean into asymmetry. A 3-column grid where one column is 1.5x wider than the others creates a custom, high-end feel.
- **Do** use `surface-container-lowest` (#000000) to create "wells" for code snippets or data logs.

### Don't:
- **Don't** use 100% white (#FFFFFF) for text. Use `on-surface` (#dee5ff) to reduce eye strain and maintain the indigo tint.
- **Don't** use standard `lg` or `xl` shadows. They disappear on dark backgrounds. Use tonal shifts or luminous glows instead.
- **Don't** use dividers. If two pieces of information need a line between them, your spacing or background-toning has failed. Use a 4px gap or a `surface-container` shift instead.