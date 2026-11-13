# Walkthrough: how the page is built and how it moves

One part per top-level section, top to bottom, as measured at 1440 px. Sizes are CSS pixels; colours are as computed. Every file named here is in this folder. How things move and behave (scrolling, page changes, the menu, hovers, clicks), step by step, is in `reference/motion/README.md`.

## 01 · div

- **Box:** 1440×56 px, starting 0 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 3, gap 8px, normal/center.
- **Type:** ui-monospace 400 10.5px/15.75px · ui-sans-serif 500 13px/19.5px (family weight size/line-height, most text first).
- **Inside:** 2 paragraphs, 1 button, 9 links, 11 drawings.
- **Look:** `reference/sections/01-div.jpg` and its anatomy `reference/sections/01-div.anatomy.jpg`.
- **Markup:** `reference/sections/01-div.html`.
- **Drawings:** `reference/assets/svg/001-icon-div.svg` (icon, 16×16), `reference/assets/svg/002-icon-div.svg` (icon, 14×14).
- **Hover:** `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:text-neutral-800:hover` changes color; `.ibtn-sm:hover` changes background; `.ibtn-sm:hover` changes background; `.ibtn-sm:hover` changes color.

## 02 · div

- **Box:** 1440×177 px, starting 73 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 2, gap 8px, normal/center.
- **Type:** ui-sans-serif 500 12.5px/18.75px · ui-sans-serif 500 11.5px/13.8px · ui-sans-serif 500 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 1 paragraph, 4 links, 4 drawings.
- **Look:** `reference/sections/02-div.jpg` and its anatomy `reference/sections/02-div.anatomy.jpg`.
- **Markup:** `reference/sections/02-div.html`.
- **Drawings:** `reference/assets/svg/003-logo-div.svg` (logo, 14×14), `reference/assets/svg/004-icon-div.svg` (icon, 14×14), `reference/assets/svg/005-icon-div.svg` (icon, 14×14), `reference/assets/svg/006-icon-div.svg` (icon, 14×14).
- **Hover:** `.nav-item:hover` changes background; `.nav-item:hover` changes background; `.nav-item:hover` changes color.
- **Control states:** `reference/components/01-button.jpg` (button a.nav-item:nth-of-type(1): rest, hover, focus).
- **Control states:** `reference/components/02-nav-link.jpg` (nav-link a.nav-item:nth-of-type(2): rest, hover, focus).
- **Control states:** `reference/components/03-nav-link.jpg` (nav-link a.nav-item:nth-of-type(3): rest, hover, focus).

## 03 · div

- **Box:** 1440×123 px, starting 250 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 3, gap 8px, normal/center.
- **Type:** ui-sans-serif 500 12.5px/18.75px · ui-sans-serif 500 11.5px/13.8px · ui-sans-serif 500 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 1 paragraph, 2 links, 2 drawings.
- **Look:** `reference/sections/03-div.jpg` and its anatomy `reference/sections/03-div.anatomy.jpg`.
- **Markup:** `reference/sections/03-div.html`.
- **Drawings:** `reference/assets/svg/007-icon-div.svg` (icon, 14×14), `reference/assets/svg/008-icon-div.svg` (icon, 14×14).
- **Hover:** `.nav-item:hover` changes background; `.nav-item:hover` changes background; `.nav-item:hover` changes color.

## 04 · div

- **Box:** 1440×123 px, starting 373 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 3, gap 8px, normal/center.
- **Type:** ui-sans-serif 500 12.5px/18.75px · ui-sans-serif 500 11.5px/13.8px · ui-sans-serif 500 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 1 paragraph, 2 links, 2 drawings.
- **Look:** `reference/sections/04-div.jpg` and its anatomy `reference/sections/04-div.anatomy.jpg`.
- **Markup:** `reference/sections/04-div.html`.
- **Drawings:** `reference/assets/svg/009-icon-div.svg` (icon, 14×14), `reference/assets/svg/010-icon-div.svg` (icon, 14×14).
- **Hover:** `.nav-item:hover` changes background; `.nav-item:hover` changes background; `.nav-item:hover` changes color.

## 05 · div

- **Box:** 1440×143 px, starting 757 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 2, gap 8px, normal/center.
- **Type:** ui-sans-serif 400 11px/15.95px · ui-sans-serif 500 12px/16.5px · ui-sans-serif 500 11.5px/13.8px · ui-monospace 400 11px/15.95px · ui-sans-serif 500 11px/16.5px (family weight size/line-height, most text first).
- **Inside:** 3 paragraphs, 1 link.
- **Look:** `reference/sections/05-div.jpg` and its anatomy `reference/sections/05-div.anatomy.jpg`.
- **Markup:** `reference/sections/05-div.html`.
- **Hover:** `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-black\/\[0\.04\]:hover` changes background.
- **Control states:** `reference/components/04-card.jpg` (card a.squircle.block: rest, hover, focus).

## 06 · header

- **Box:** 1440×56 px, starting 0 px from the top. Background oklab(0.999994 0.0000455678 0.0000200868 / 0.85), text lab(2.75381 0 0).
- **Layout:** flex row of 6, gap 16px, normal/center.
- **Type:** ui-sans-serif 400 12.5px/17.5px · ui-sans-serif 500 12.5px/17.5px · ui-sans-serif 600 10.5px/15.75px · ui-sans-serif 600 10px/10px (family weight size/line-height, most text first).
- **Inside:** 4 buttons, 1 link, 5 drawings, 1 field.
- **Look:** `reference/sections/06-header.jpg` and its anatomy `reference/sections/06-header.anatomy.jpg`.
- **Markup:** `reference/sections/06-header.html`.
- **Drawings:** `reference/assets/svg/011-icon-header.svg` (icon, 14×14), `reference/assets/svg/012-icon-header.svg` (icon, 12×12), `reference/assets/svg/013-icon-header.svg` (icon, 14×14), `reference/assets/svg/014-icon-header.svg` (icon, 14×14), `reference/assets/svg/015-icon-header.svg` (icon, 14×14).
- **Hover:** `.ibtn:hover` changes background; `.ibtn:hover` changes background; `.ibtn:hover` changes color; `.crumb-link:hover` changes background; `.crumb-link:hover` changes background; `.crumb-link:hover` changes color.
- **Control states:** `reference/components/05-input.jpg` (input input.field.h-8: rest, hover, focus).
- **Control states:** `reference/components/06-button.jpg` (button button.ibtn.relative:nth-of-type(2): rest, hover, focus).

## 07 · div

- **Box:** 1440×52 px, starting 80 px from the top. Background lab(98.26 0 0), text lab(2.75381 0 0).
- **Layout:** flex row of 2, gap 16px, space-between/flex-end.
- **Type:** ui-sans-serif 400 12.5px/18.75px · ui-sans-serif 500 13px/19.5px · ui-sans-serif 600 20px/25px (family weight size/line-height, most text first).
- **Inside:** 1 heading, 1 paragraph, 2 buttons, 2 drawings.
- **Look:** `reference/sections/07-div.jpg` and its anatomy `reference/sections/07-div.anatomy.jpg`.
- **Markup:** `reference/sections/07-div.html`.
- **Drawings:** `reference/assets/svg/016-icon-div.svg` (icon, 14×14), `reference/assets/svg/017-icon-div.svg` (icon, 14×14).
- **Hover:** `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-neutral-800:hover` changes background.

## 08 · div

- **Box:** 1440×73 px, starting 156 px from the top. Background rgb(255, 255, 255), text lab(2.75381 0 0).
- **Layout:** flex row of 3, gap 16px, normal/center.
- **Type:** ui-sans-serif 400 11.5px/16.675px · ui-sans-serif 500 13px/18.2px · ui-sans-serif 500 13px/19.5px (family weight size/line-height, most text first).
- **Inside:** 2 paragraphs, 1 button, 1 drawing.
- **Look:** `reference/sections/08-div.jpg` and its anatomy `reference/sections/08-div.anatomy.jpg`.
- **Markup:** `reference/sections/08-div.html`.
- **Drawings:** `reference/assets/svg/018-icon-div.svg` (icon, 14×14).
- **Hover:** `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-black\/\[0\.04\]:hover` changes background.

## 09 · div

- **Box:** 1440×138 px, starting 245 px from the top. Background lab(98.26 0 0), text lab(2.75381 0 0).
- **Layout:** grid, 4 columns (274px 274px 274px 274px), gap 16px.
- **Type:** ui-sans-serif 400 11.5px/17.25px · ui-sans-serif 500 11.5px/13.8px · ui-sans-serif 600 28px/30.24px · ui-sans-serif 500 11px/11px (family weight size/line-height, most text first).
- **Inside:** 8 paragraphs, 8 drawings.
- **Look:** `reference/sections/09-div.jpg` and its anatomy `reference/sections/09-div.anatomy.jpg`.
- **Markup:** `reference/sections/09-div.html`.
- **Drawings:** `reference/assets/svg/019-decoration-div.svg` (decoration, 72×24), `reference/assets/svg/020-icon-div.svg` (icon, 12×12, ×2), `reference/assets/svg/021-decoration-div.svg` (decoration, 72×24), `reference/assets/svg/022-decoration-div.svg` (decoration, 72×24), `reference/assets/svg/023-icon-div.svg` (icon, 12×12, ×3), `reference/assets/svg/024-decoration-div.svg` (decoration, 72×24), `reference/assets/svg/025-icon-div.svg` (icon, 12×12).
- **Control states:** `reference/components/07-card.jpg` (card div.squircle.border:nth-of-type(1): rest, hover, focus).

## 10 · div

- **Box:** 1440×500 px, starting 399 px from the top. Background lab(98.26 0 0), text lab(2.75381 0 0).
- **Layout:** grid, 12 columns (80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px), gap 16px.
- **Type:** ui-sans-serif 400 11.5px/16.675px · ui-sans-serif 400 11px/16.5px · ui-sans-serif 400 10.5px/15.225px · ui-sans-serif 400 12.5px/18.75px · ui-sans-serif 500 12.5px/15.625px (family weight size/line-height, most text first).
- **Inside:** 3 headings, 23 paragraphs, 6 buttons, 4 drawings.
- **Look:** `reference/sections/10-div.jpg` and its anatomy `reference/sections/10-div.anatomy.jpg`.
- **Markup:** `reference/sections/10-div.html`.
- **Drawings:** `reference/assets/svg/026-illustration-div.svg` (illustration, 723×269), `reference/assets/svg/027-icon-div.svg` (icon, 14×14), `reference/assets/svg/028-icon-div.svg` (icon, 12×12, ×2).
- **Hover:** `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.hover\:bg-black\/\[0\.04\]:hover` changes background; `.ibtn:hover` changes background; `.ibtn:hover` changes background; `.ibtn:hover` changes color; `.seg:hover` changes color.

## 11 · div

- **Box:** 1440×366 px, starting 915 px from the top. Background lab(98.26 0 0), text lab(2.75381 0 0).
- **Layout:** grid, 12 columns (80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px 80.6562px), gap 16px.
- **Type:** ui-sans-serif 400 11.5px/16.675px · ui-sans-serif 500 13px/18.2px · ui-sans-serif 500 12.5px/18.75px · ui-monospace 400 10.5px/14.7px · ui-monospace 400 11.5px/16.675px (family weight size/line-height, most text first).
- **Inside:** 2 headings, 28 paragraphs, 2 buttons, 9 drawings.
- **Look:** `reference/sections/11-div.jpg` and its anatomy `reference/sections/11-div.anatomy.jpg`.
- **Markup:** `reference/sections/11-div.html`.
- **Drawings:** `reference/assets/svg/029-icon-div.svg` (icon, 14×14, ×2), `reference/assets/svg/030-icon-div.svg` (icon, 14×14, ×3), `reference/assets/svg/031-icon-div.svg` (icon, 14×14, ×2).
- **Hover:** `.hover\:bg-black\/\[0\.02\]:hover` changes background; `.hover\:bg-black\/\[0\.02\]:hover` changes background; `.hover\:bg-black\/\[0\.05\]:hover` changes background; `.hover\:bg-black\/\[0\.05\]:hover` changes background; `.hover\:text-neutral-900:hover` changes color.
- **Control states:** `reference/components/08-badge.jpg` (badge span.badge.bg-amber-50: rest, hover, focus).
