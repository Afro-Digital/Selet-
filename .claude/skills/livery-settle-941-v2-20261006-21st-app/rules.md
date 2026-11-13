# settle-941-v2-20261006.21st.app: design rules

A light interface on a near-white neutral background where a green accent marks the next step. Type is ui-sans-serif set tight at large sizes, corners are 7px, and depth comes from soft neutral shadows.

## Principles

### Soft, neutral depth

Lift raised elements with the measured shadow (rgba(0, 0, 0, 0.05) 0px 1px 2px 0px).

_Why:_ Shadows appear on about 8% of elements; they mark what floats above the page and are never tinted.

### Even, compact hierarchy

Keep type sizes close together, anchored on 12.5px body text.

_Why:_ The largest measured size is only 2.2× the body size; hierarchy comes from weight and spacing instead.

### A steady rhythm

Space everything on the 8px grid: 2, 8, 16, 24px.

_Why:_ 84% of measured spacing values fall on this grid, which is what makes the layout feel ordered.

### Consistent corners

Use 7px corners as the default radius.

_Why:_ It is the most common measured radius; one radius family is what makes separate components feel like one product.

## Never

- **Never tint shadows with colour.** Every measured shadow is neutral; a coloured glow would read as a different product.
- **Never introduce a second accent colour.** Only one saturated colour (#007a55) carries weight in the measured palette.
- **Never use positive letter-spacing on headings.** Large type is tightened, down to -0.03em on the biggest sizes.
- **Never animate longer than 150ms.** Every measured transition finishes within 150ms; slower motion would feel heavy here.
- **Never set button labels in all capitals.** No measured button uses uppercase text.
- **Never mix in a second display typeface.** Headings and body share ui-sans-serif; a second family would split the voice.
- **Never use spacing off the 8px grid.** 84% of measured spacing sits on it.

## Colour

- Light theme: near-white neutral background (#fafafa).
- Body text #0a0a0a on the background reads at 19.0:1; secondary text uses #525252.
- Accent #007a55 (green) with #ffffff text on top of it.
- A dark theme also exists: #0a0a0a background, #fafafa text; tokens.json lists both.

## Typography

- ui-sans-serif throughout.
- Scale: h1 28px, h2 20px, h3 15px, h4 14px, h5 13px, body 12.5px, small 12px.
- Weights in use: 400, 500, 600.
- Headings are tightened (-0.03em at 28px); body text keeps normal tracking.

## Shape and depth

- Radii: 6px (3%), 7px (20%), 8px (7%), 9px (11%), 10px (15%), 18px (14%), pill (29%).
- Borders: 1px in #e8e8e8.
- Shadows: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px | rgb(255, 255, 255) 0px 0px 0px 2px.
