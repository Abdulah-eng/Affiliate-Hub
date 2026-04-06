# Design System Strategy: The Neon Obsidian Narrative

## 1. Overview & Creative North Star: "The Kinetic Vault"
This design system is built on the **"Kinetic Vault"** philosophy. In the high-stakes world of Philippine affiliate marketing and fintech, the interface must feel like a high-security digital asset—private, premium, and powerful—while maintaining the fluid energy of a high-performance gaming rig.

We move beyond the "SaaS Template" by embracing **Deep Dimensionality**. Instead of flat boxes on a page, the UI is treated as a series of floating glass HUD (Heads-Up Display) elements suspended over a vast, dark obsidian void (`background: #060e20`). We use intentional asymmetry—such as offset data visualizations and overlapping glass cards—to break the rigid grid and create a sense of bespoke craftsmanship.

---

## 2. Colors & Surface Architecture

### The Palette
The core of this system is the contrast between the infinite depth of the dark surfaces and the electric energy of the neon accents.
- **Primary / Primary-Container (`#81ecff` / `#00e3fd`):** Our "Neon Cyan." Use this for high-action states and critical growth metrics.
- **Secondary (`#6e9bff`):** The "Deep Electric Blue." Used for secondary actions and to balance the vibrance of the cyan.
- **Tertiary (`#a68cff`):** The "Vivid Violet." Reserved for tertiary data points or "bonus" milestones (gaming-inspired cues).

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. Structural definition must be achieved through:
1.  **Background Shifts:** Transitioning from `surface` to `surface_container_low`.
2.  **Tonal Transitions:** Using subtle `0.5rem` gaps between containers to let the base `background` peek through.
3.  **Neon Glows:** Using a `1px` inner-shadow with `primary` at 20% opacity to "suggest" a boundary rather than draw a hard line.

### Glass & Gradient Rule
To achieve the premium fintech aesthetic, use **Glassmorphism** for all primary dashboard cards:
- **Background:** `surface_container` with 60% opacity.
- **Backdrop-blur:** `16px` to `24px`.
- **Signature Texture:** Apply a linear gradient (45deg) from `primary` to `secondary` at 5% opacity across the surface to give the "glass" a tinted, high-end finish.

---

## 3. Typography: The Editorial HUD
We pair **Plus Jakarta Sans** (Display/Headline) with **Inter** (Body/Label) to balance high-tech "gaming" energy with professional legibility.

- **Display-LG/MD (`3.5rem` / `2.75rem`):** Use for total earnings or hero affiliate counts. Letter spacing should be set to `-0.02em` to feel tighter and more premium.
- **Headline-SM (`1.5rem`):** The standard for card titles. Always use `on_surface` to ensure maximum contrast against the dark background.
- **Body-MD (`0.875rem`):** Used for all data descriptions. Use `on_surface_variant` (`#a3aac4`) to create a clear hierarchy between the "Data Value" (Bright) and the "Label" (Muted).

---

## 4. Elevation & Depth: Tonal Layering

### The Layering Principle
Depth is created through a "Stacking" logic of surface tokens:
1.  **Level 0 (The Void):** `surface_dim` (`#060e20`) – The canvas.
2.  **Level 1 (The Zone):** `surface_container_low` (`#091328`) – For sidebar or navigation areas.
3.  **Level 2 (The Interactive):** `surface_container_high` (`#141f38`) – For primary dashboard cards.
4.  **Level 3 (The Floating):** `surface_bright` (`#1f2b49`) – For tooltips and dropdowns.

### Ambient Shadows & Neon Halos
Avoid black shadows. Floating elements use:
- **Shadow Color:** `secondary` at 8% opacity.
- **Blur:** `40px` to `60px` for a soft, atmospheric glow that feels like light reflecting off a dark surface.
- **Ghost Border Fallback:** If a border is required for accessibility, use `outline_variant` at **15% opacity**.

---

## 5. Signature Components

### Premium Cards
- **Corner Radius:** `xl` (`3rem`) for the main container; `lg` (`2rem`) for nested cards.
- **Styling:** No dividers. Use `surface_container_highest` for header sections and a subtle `3.5rem` (spacing 10) vertical padding to separate content blocks.

### Interactive Data Tables
- **Row Styling:** Instead of lines, use a `surface_container_low` hover state with a `primary` neon vertical bar (2px wide) on the far left of the row.
- **Header:** Use `label-md` in all-caps with `0.1em` letter spacing for a technical, "data-feed" vibe.

### Multi-Select Progress Cards
- **Active State:** Use a 1px "Neon Border" created with a linear gradient of `primary` to `secondary`. 
- **Progress Bars:** Use `primary_dim` for the track and a `primary` to `secondary` gradient for the fill. Add a small `primary` glow (`box-shadow: 0 0 8px`) to the leading edge of the progress bar to simulate "energy."

### Buttons
- **Primary:** `primary` background with `on_primary` text. Apply a subtle `primary` outer glow on hover.
- **Secondary:** Transparent background with a `Ghost Border` (20% opacity `primary`).
- **Radius:** `full` (`9999px`) for a sleek, modern pill shape.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Vapor" Transitions:** When cards appear, animate them with a slight slide-up and opacity fade-in.
- **Embrace Negative Space:** Use the `24` (`8.5rem`) spacing token to separate major dashboard modules. High-end design breathes.
- **Tint your Greys:** Ensure all "neutral" surfaces use the deep navy/slate tokens provided, never pure hex `#222222`.

### Don't:
- **Don't use 100% White:** Use `on_surface` (`#dee5ff`) for text. Pure white (`#ffffff`) is too harsh and breaks the premium dark-mode immersion.
- **Don't use Dividers:** If you feel the urge to draw a line, increase the spacing by one level on the scale instead.
- **Don't Over-Glow:** Neon accents should be like "jewelry"—distinguished and intentional. If every element glows, nothing is important.