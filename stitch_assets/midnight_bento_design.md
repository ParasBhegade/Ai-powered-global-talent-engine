# Design System Specification: The Obsidian Ledger

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Ledger"**

This design system is engineered for the high-density requirements of an AI Talent Engine, moving away from generic SaaS "dashboard-itis" toward a high-end editorial experience. We are creating a digital environment that feels like a premium financial journal crossed with a futuristic command center.

The aesthetic centers on **intentional asymmetry** and **tonal depth**. By utilizing a "Neo-Bento" layout, we organize complex data into logical, digestible clusters without relying on the restrictive visual noise of traditional borders. The system prioritizes "breathing room" through a strict 24px rhythmic gap, ensuring that even the most data-dense screens feel curated rather than cluttered.

---

## 2. Colors: Tonal Architecture
The soul of this system lies in its dark-mode depth. We do not use "gray"; we use shifting shades of obsidian and slate to define space.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Physical boundaries must be defined through **background color shifts** or **tonal transitions**. 
- A card (`surface_container`) should sit on the `background` purely by its contrast.
- Visual separation is achieved through the 24px gap, letting the `background` act as the negative space "gutter."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy to "stack" importance:
- **Level 0 (Foundation):** `background` (#0b1325) – The infinite base.
- **Level 1 (Sub-sections/Wells):** `surface_container_low` (#131b2e) – Used for recessed areas like sidebar tracks or grouped backgrounds.
- **Level 2 (Primary Containers):** `surface_container` (#171f32) – The standard card face for Bento boxes.
- **Level 3 (Interactive/Active):** `surface_container_high` (#222a3d) – Reserved for hover states or active selections.
- **Input Wells:** `wells` (#000000) – For form inputs and code blocks, creating a "punch-out\" effect that recedes into the screen.

### The \"Glass & Gradient\" Rule
To elevate the \"Editorial\" feel, use **Glassmorphism** for floating elements (modals, dropdowns). 
- **Class:** `.glass-card`
- **Spec:** `background: rgba(23, 31, 50, 0.7); backdrop-filter: blur(12px);`
- **Gradients:** Use a linear gradient for primary CTAs transitioning from `primary` (#a3a6ff) to `primary_container` (#6063ee) at a 135-degree angle.

---

## 3. Typography: Editorial Authority
We use a high-contrast typographic scale to establish clear hierarchy in a data-dense environment.

### Headings (Manrope)
*Headings are the \"Anchor.\"*
- **Weights:** 600 (Semibold) for sub-headers, 800 (Extra Bold) for main titles.
- **Letter Spacing:** Strictly `-0.02em`. This creates a tight, authoritative \"Swiss\" look.
- **Usage:** Use `display-lg` for hero stats and `headline-md` for Bento box titles.

### Body & Microcopy (Inter)
*Inter is the \"Workhorse.\"*
- **Weights:** 400 (Regular) for descriptions, 600 (Semibold) for labels and UI actions.
- **Logic:** In data-dense tables, use `body-sm` with increased line-height (1.6) to ensure the AI-generated text remains legible at small sizes.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too \"standard.\" This system uses **Atmospheric Depth.**

- **The Layering Principle:** Depth is achieved by placing lighter surfaces on darker ones. An element that is \"closer\" to the user is physically lighter in hex value (`surface_container_highest`).
- **Ambient Shadows:** For floating components like tooltips or modals, use a tinted shadow: `box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);`. Never use pure gray shadows; the shadow must feel like it's an occlusion of the deep blue background.
- **The \"Ghost Border\":** If accessibility requires a border, use the **Ghost Border** method. 
    - **Spec:** `1px solid rgba(144, 143, 160, 0.15)` (using `outline_variant` at low opacity). It should be felt, not seen.

---

## 5. Components: Custom Signature Elements

### Buttons (`.btn-cta`)
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. No border.
- **Secondary:** Surface High fill with a \"Ghost Border.\"
- **Interaction:** On hover, a subtle `0.5rem` glow using the `surface_tint`.

### Input Fields (`.form-input`)
- **Visuals:** Background: `#000000` (Pure Black Wells). 
- **Focus State:** No thick outlines. Instead, transition the \"Ghost Border\" from 15% opacity to 40% indigo.
- **Typography:** Use `label-md` for floating labels in `muted_text` (#a3aac4).

### Bento Cards (`.glass-card`)
- **Gaps:** Always `24px` (`gap: 1.5rem`).
- **Rounding:** Use `xl` (0.75rem) for external Bento containers; `md` (0.375rem) for inner nested elements.
- **Content:** Forbid divider lines. Use `surface_container_low` bands or vertical white space to separate list items within a card.

### Chips & Badges
- **Selection Chips:** Use `secondary_container` with `on_secondary_container` text.
- **Success/High-Highlight:** Use `tertiary` (#69f6b8) for \"AI Match Score\" or \"Candidate Found\" indicators to provide a sharp, neon contrast against the dark obsidian.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical layouts. A 3-column grid where one column is 2x wider creates a high-end editorial feel.
- **Do** use \"Optical Alignment.\" Icons next to Manrope headers should be visually centered to the X-height, not the cap height.
- **Do** lean into `surface_container_lowest` for large-scale background sectioning.

### Don't
- **Don't** use 100% white (#FFFFFF). Always use `primary_text` (#dee5ff) to prevent eye strain.
- **Don't** use standard \"cards-on-gray\" patterns. If a section needs to be distinct, change the background color of the entire section rather than adding a border.
- **Don't** use Tailwind utility classes. All styles must be encapsulated in the semantic CSS classes provided (`.glass-card`, etc.) to maintain the integrity of the \"Ledger\" aesthetic.
- **Don't** use divider lines. If you feel the need for a line, increase the vertical spacing by one step on the scale instead.
