# Motion and Interactions

Snappy: transitions finish within 150ms.

- Default to 150ms transitions (100% of measured ones).
- Ease with cubic-bezier(0.4, 0, 0.2, 1).
- Animate color, background-color, border-color, outline-color; avoid animating layout.
- Turn every loop and decorative animation off under prefers-reduced-motion, as the site does.

## Interactions

- **Hover** changes background colour (71% of hover rules), text colour (29% of hover rules). Things rarely move on hover; they change colour.

## Measurements

- Durations: 150ms (100%)
- Easings: `cubic-bezier(0.4, 0, 0.2, 1)`
- Animated properties: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from

The site turns its motion off under `prefers-reduced-motion: reduce`. Do the same: every looping or decorative animation stops, and state changes happen instantly.
