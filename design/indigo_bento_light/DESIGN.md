# Design System Document: The Modular Bento Framework

## 1. Overview & Creative North Star: "The Digital Curator"
This design system moves away from the rigid, boxed-in nature of traditional grids. Our Creative North Star is **The Digital Curator**—a philosophy that treats every interface as a high-end editorial gallery. 

Instead of a "template" feel, we achieve an innovative aesthetic through **Intentional Asymmetry** and **Weighted Negative Space**. The "Bento" approach here isn't just about boxes; it’s about the mathematical harmony between oversized typography and intimate micro-containers. We break the grid by allowing certain elements to bleed, overlap, or sit in "floating" layers, ensuring the UI feels like a bespoke digital experience rather than a generic dashboard.

---

## 2. Colors & Surface Philosophy
The palette utilizes a sophisticated Indigo core with high-performance Emerald accents. However, the secret to the system's premium feel lies in its **Tonal Layering**.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural definition must be achieved solely through:
1.  **Background Color Shifts:** Placing a `surface_container_lowest` card on a `surface_container_low` background.
2.  **Shadow Depth:** Using elevation to imply boundaries.
3.  **Negative Space:** Using a minimum of 32px gaps to define groups.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy to "nest" importance:
*   **Base Layer:** `surface` (#F9F9FF) for the overall canvas.
*   **Section Layer:** `surface_container_low` (#F0F3FF) to group related Bento modules.
*   **Interaction Layer:** `surface_container_lowest` (#FFFFFF) for primary cards and input areas to make them "pop" forward.

### The "Glass & Gradient" Rule
To inject "soul" into the minimal aesthetic:
*   **Floating Elements:** Use `surface_variant` with 60% opacity and a `20px backdrop-blur` for navigation bars or floating modals.
*   **Signature Gradients:** Use a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#4648D4) to `primary_container` (#6063EE) for hero CTAs to avoid a flat, "standard" look.

---

## 3. Typography: The Editorial Scale
We pair the geometric authority of **Plus Jakarta Sans** (Display/Headlines) with the utilitarian clarity of **Inter** (Body).

*   **Display (L/M/S):** Plus Jakarta Sans. Use `display-lg` (3.5rem) with -0.02em letter spacing for hero sections. This creates an "Impact Editorial" feel.
*   **Headlines:** Plus Jakarta Sans (Bold 800). These are your anchors. Always keep line heights tight (1.1–1.2) to maintain a "blocky" modular aesthetic.
*   **Body:** Inter. Use `body-md` (0.875rem) for the majority of content. The 400 weight provides breathability, while 600 is reserved for functional emphasis.
*   **Labels:** `label-sm` (0.6875rem) should always be Uppercase with +0.05em tracking to act as "metadata" markers within the Bento cells.

---

## 4. Elevation & Depth
Depth is not an afterthought; it is a functional tool for hierarchy.

### Tonal Layering Principle
Avoid "Drop Shadows" as a default. Instead, stack your tokens:
*   Place a `surface_container_highest` (#D8E3FB) element atop a `surface` background to create a "Soft Inset" look.

### Ambient Shadows
When an element must float (e.g., a primary Action Card), use **Ambient Shadows**:
*   **Shadow:** `0px 20px 40px rgba(17, 28, 45, 0.06)`
*   **Color Tinting:** Never use pure black. Tint the shadow with a hint of `on_surface` to mimic natural light passing through a tinted lens.

### The "Ghost Border" Fallback
If accessibility requires a border, use a **Ghost Border**: `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components & Bento Elements

### Buttons (The "Jewel" Components)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (1.5rem) corner radius. No border. High-contrast `on_primary` text.
*   **Secondary:** `surface_container_highest` background with `primary` text. 
*   **CTA Emerald:** Reserved strictly for "Final Actions" (Submit, Purchase). Use `secondary` (#006C49) for text on a `secondary_fixed` (#6FFBBE) base.

### Bento Cards
*   **Corner Radius:** Consistently use `xl` (1.5rem / 24px) for outer containers and `lg` (1rem / 16px) for nested internal elements.
*   **Separation:** **Forbid the use of divider lines.** Use vertical white space from the spacing scale (e.g., 24px, 32px, 48px) to separate content chunks within a card.

### Input Fields
*   **Style:** `surface_container_lowest` background with a `Ghost Border`. On focus, the border opacity increases to 100% of the `primary` token, and a subtle `primary_fixed` outer glow (4px) appears.

### Interactive Chips
*   **Filter Chips:** Use `surface_container_high`. On selection, transition to `primary` with `on_primary` text. Use a 200ms ease-in-out transform (scale 1.05) on hover.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use varying Bento cell heights. A uniform grid is a boring grid.
*   **DO** use "Overhang" typography—where a headline slightly overlaps an image or a secondary container.
*   **DO** utilize the `tertiary` (Amber) tokens for micro-moments of delight, like a small notification dot or a star rating.

### Don’t:
*   **DON'T** use 1px dividers. If you feel the need to separate, increase the `gap` or shift the `surface` tone.
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#111C2D) to maintain the premium, soft-slate aesthetic.
*   **DON'T** use sharp corners. Everything in this system must feel approachable; if it’s not `lg` or `xl` roundedness, it doesn't belong.