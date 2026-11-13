# How it moves, step by step

Every animation and behaviour found on the page, as recipes: what starts it, which element, which property from what to what, for how long, on which curve, in what order. Times are from the moment the trigger happens. Build them one at a time and check each against its film (frames captioned with their time, or with the scroll position).

Measured at 1440 px on settle-941-v2-20261006.21st.app. Values in `code` are exactly as the browser reported them.

## The page's motion language

- **Curves:** `cubic-bezier(0.22, 0.9, 0.3, 1)` (2×).
- **Durations:** 160 ms.

### 1. The header `header.sticky` as you scroll

- **Behaviour:** it stays in place while you scroll.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 14757 (`sticky`: `"Overview"});return(0,t.jsxs)("header",{className:"sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bord`); `reference/scripts/10-0cz1d0mv5g-q7.js` at character 44721 (`sticky`: `&(n=!!e&&Rs(e,"s")>-1)&&(e=xs(e,/s/g,"")),r=e,Ts&&"sticky"in js&&(o=!!e&&Rs(e,"y")>-1)&&Ms&&(e=xs(e,/y/g,"")),ds&&(i=fun`).

### 2. The phone menu (`button.shrink-0` at 390 px)

- **In order:**
  1. 8 ms: `div.flex.min-h-screen:nth-of-type(2) > div.flex.min-w-0:nth-of-type(1) > header.sticky.top-0 > button.shrink-0.rounded-full:nth-of-type(2)` `aria-describedby` set to `settle-tip`
  1. 10 ms: `div#settle-tip` `left` `(unset)` → `166.734px`
  1. 10 ms: `div#settle-tip` `top` `(unset)` → `45.5px`
  1. 21 ms: `div.flex.min-h-screen:nth-of-type(2) > div.flex.min-w-0:nth-of-type(1) > header.sticky.top-0 > div.relative.ml-auto:nth-of-type(1) > input.field.h-8` `name` set to ``
  1. 21 ms: `div.flex.min-h-screen:nth-of-type(2) > div.flex.min-w-0:nth-of-type(1) > header.sticky.top-0 > div.relative.ml-auto:nth-of-type(1) > input.field.h-8` `type` set to `search`
  1. 21 ms: `div.flex.min-h-screen:nth-of-type(2) > div.flex.min-w-0:nth-of-type(1) > header.sticky.top-0 > button.shrink-0.rounded-full:nth-of-type(2)` `aria-expanded` set to `true`
  1. 21 ms: `div.pop.squircle:nth-of-type(4)` `left` `(unset)` → `31.7344px`
  1. 21 ms: `div.pop.squircle:nth-of-type(4)` `top` `(unset)` → `49.5px`
- **Animations that ran:**
  - 27 ms: `div#settle-tip` CSS animation `pop` on `opacity, transform`, 160 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)` (opacity: 0 → 1; transform: translateY(-4px) scale(0.985) → none)
  - 27 ms: `div.pop.squircle` CSS animation `pop` on `opacity, transform`, 160 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)` (opacity: 0 → 1; transform: translateY(-4px) scale(0.985) → none)
- **Film:** `reference/motion/menu.jpg`.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 6349 (`shrink-0`: `.href)})]},n.group))}),(0,t.jsx)("div",{className:"shrink-0 pb-4",children:(0,t.jsx)(r.default,{href:"/reconciliation","`); `reference/scripts/08-3tpkjntdex6mh.js` at character 9576 (`shrink-0`: `," · ",e.reason]})]}),(0,t.jsxs)("div",{className:"shrink-0 text-right",children:[(0,t.jsx)("p",{className:"m-0 text-[12`).

## Clicking (accordions, tabs, switches, carousels)

### 3. Clicking `switch account` opens

- 5 ms: `div.flex.min-h-screen:nth-of-type(2) > aside.fixed.inset-y-0:nth-of-type(2) > div.flex.h-14:nth-of-type(1) > button.ibtn-sm.ml-auto` `aria-describedby` set to `settle-tip`
- 12 ms: `div.flex.min-h-screen:nth-of-type(2) > aside.fixed.inset-y-0:nth-of-type(2) > div.flex.h-14:nth-of-type(1) > button.ibtn-sm.ml-auto` `aria-expanded` set to `true`
- 27529 ms: `div.flex.min-h-screen > aside.fixed.inset-y-0 > div.flex.h-14 > button.ibtn-sm.ml-auto` CSS transition on `color`, 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (color: oklab(0.707999 -0.00000712276 0.0000166297) → oklab(0.268999 -0.00000260025 0.00000627339))
- 27529 ms: `div.flex.min-h-screen > aside.fixed.inset-y-0 > div.flex.h-14 > button.ibtn-sm.ml-auto` CSS transition on `backgroundColor`, 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (backgroundColor: oklab(0 0 0 / 0) → oklab(0 0 0 / 0.06))
- 27529 ms: `div#settle-tip` CSS animation `pop` on `opacity, transform`, 160 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)` (opacity: 0 → 1; transform: translateY(-4px) scale(0.985) → none)
- 27529 ms: `div.pop.squircle` CSS animation `pop` on `opacity, transform`, 160 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)` (opacity: 0 → 1; transform: translateY(-4px) scale(0.985) → none)
- **Clicking again** puts it back the same way.
- **Before and after:** `reference/motion/clicks/01-switch-account.jpg`.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2785 (`flex`: `ite/[0.06]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("p",{className:(0,i.cn)(`); `reference/scripts/08-3tpkjntdex6mh.js` at character 4042 (`flex`: `:col-span-9",children:[(0,t.jsx)("div",{className:"flex min-w-0 flex-1 items-center px-4 pt-4",children:(0,t.jsx)(N.Line`); `reference/scripts/11-3mc6dra1m0098.js` line 1 (`flex`).

### 4. Clicking `export day` switches

- **Words:** `div.flex.min-h-screen:nth-of-type(2) > div.pointer-events-none.fixed:nth-of-type(2)` `Settlement report queuedSettlement report queued` → `Settlement report queued`.
- 5 ms: `div.flex.min-h-screen:nth-of-type(2) > aside.fixed.inset-y-0:nth-of-type(2) > div.flex.h-14:nth-of-type(1) > button.ibtn-sm.ml-auto` `aria-describedby` set to ``
- 31427 ms: `div.flex.min-h-screen > aside.fixed.inset-y-0 > div.flex.h-14 > button.ibtn-sm.ml-auto` CSS transition on `backgroundColor`, 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (backgroundColor: oklab(0 0 0 / 0.06) → rgba(0, 0, 0, 0))
- 31427 ms: `div.flex.min-h-screen > aside.fixed.inset-y-0 > div.flex.h-14 > button.ibtn-sm.ml-auto` CSS transition on `color`, 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (color: oklab(0.268999 -0.00000260025 0.00000627339) → oklab(0.707999 -0.00000712276 0.0000166297))
- 31427 ms: `div.mx-auto.w-full > div.flex.flex-wrap > div.flex.flex-wrap > button.btn.border` CSS transition on `backgroundColor`, 150 ms, `cubic-bezier(0.4, 0, 0.2, 1)` (backgroundColor: rgba(0, 0, 0, 0) → oklab(0 0 0 / 0.04))
- 31427 ms: `div.flex.min-h-screen > div.pointer-events-none.fixed > div.rise.squircle` CSS animation `rise` on `opacity, transform`, 160 ms, `cubic-bezier(0.22, 0.9, 0.3, 1)` (opacity: 0 → 1; transform: translateY(8px) → none)
- **Clicking again** puts it back the same way.
- **Before and after:** `reference/motion/clicks/02-export-day.jpg`.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2785 (`flex`: `ite/[0.06]",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("p",{className:(0,i.cn)(`); `reference/scripts/08-3tpkjntdex6mh.js` at character 4042 (`flex`: `:col-span-9",children:[(0,t.jsx)("div",{className:"flex min-w-0 flex-1 items-center px-4 pt-4",children:(0,t.jsx)(N.Line`); `reference/scripts/11-3mc6dra1m0098.js` line 1 (`flex`).

## Text that changes in place

### 5. `div.squircle.pointer-events-none > p.m-0.font-medium:nth-of-type(1)`: a scramble, when the pointer moves

- **Sequence:** `9 Sep` → `5 Sep` → `1 Sep` → `27 Aug` → `23 Aug` → `19 Aug` → `14 Aug` → `17 Aug` → `20 Aug` → `23 Aug` (1434 ms).
- **How:** each frame, show the final text with the not-yet-settled letters replaced by random characters, settling one more letter every few frames from left to right.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2540 (`squircle`: `jsxs)(r.default,{href:"/reconciliation",className:"squircle block w-full rounded-[12px] border border-black/[0.06] bg-ne`); `reference/scripts/08-3tpkjntdex6mh.js` at character 1590 (`squircle`: `"),children:[(0,t.jsx)("span",{className:(0,x.cn)("squircle grid h-8 w-8 shrink-0 place-items-center rounded-[10px]",b.T`); `reference/scripts/07-0sh4hmvdp3dcu.js` at character 11341 (`pointer-events-none`: `aria-hidden":!0}),h>0?(0,t.jsx)("span",{className:"pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 pla`).

### 6. `div.squircle.pointer-events-none > p.m-0.mt-1:nth-of-type(2) > span.ml-auto.font-medium:nth-of-type(3)`: a counter, when the pointer moves

- **Sequence:** `$160,506.31` → `$53,320.13` → `$156,283.93` → `$141,607.43` → `$40,126.96` → `$131,226.00` → `$107,127.48` → `$141,159.91` → `$134,066.01` → `$40,126.96` (1434 ms).
- **How:** step the number toward its target each frame (or as the page scrolls), keeping the same formatting.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 3527 (`m-0`: `bg-white/[0.12]")},a))}),(0,t.jsx)("p",{className:"m-0 mt-2 text-[12px] font-medium leading-snug",children:d?d.label:"Re`); `reference/scripts/08-3tpkjntdex6mh.js` at character 5625 (`m-0`: `py-4",children:[(0,t.jsx)("p",{className:(0,x.cn)("m-0 text-[11px]",b.INK.subtle),tabIndex:0,"data-tip":l,children:e}),(`); `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2947 (`ml-auto`: `y’s close"}),(0,t.jsx)("span",{className:(0,i.cn)("ml-auto text-[11px] font-medium tabular-nums",a?.tight?C.INK.rose:C.I`).

### 7. `div.squircle.pointer-events-none > p.m-0.mt-1:nth-of-type(3) > span.ml-auto.font-medium:nth-of-type(3)`: a counter, when the pointer moves

- **Sequence:** `$10,205.05` → `$2,627.36` → `$9,881.47` → `$8,463.29` → `$2,541.07` → `$8,385.14` → `$6,607.63` → `$9,937.82` → `$8,901.49` → `$2,541.07` (1434 ms).
- **How:** step the number toward its target each frame (or as the page scrolls), keeping the same formatting.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 3527 (`m-0`: `bg-white/[0.12]")},a))}),(0,t.jsx)("p",{className:"m-0 mt-2 text-[12px] font-medium leading-snug",children:d?d.label:"Re`); `reference/scripts/08-3tpkjntdex6mh.js` at character 5625 (`m-0`: `py-4",children:[(0,t.jsx)("p",{className:(0,x.cn)("m-0 text-[11px]",b.INK.subtle),tabIndex:0,"data-tip":l,children:e}),(`); `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2947 (`ml-auto`: `y’s close"}),(0,t.jsx)("span",{className:(0,i.cn)("ml-auto text-[11px] font-medium tabular-nums",a?.tight?C.INK.rose:C.I`).

## Following the pointer

### 8. `div.squircle.pointer-events-none` answers to the pointer

- `left` `(unset)` → `184.825px` over 11 frames, easing 0.284 a frame.
- **In the code:** `reference/scripts/07-0sh4hmvdp3dcu.js` at character 2540 (`squircle`: `jsxs)(r.default,{href:"/reconciliation",className:"squircle block w-full rounded-[12px] border border-black/[0.06] bg-ne`); `reference/scripts/08-3tpkjntdex6mh.js` at character 1590 (`squircle`: `"),children:[(0,t.jsx)("span",{className:(0,x.cn)("squircle grid h-8 w-8 shrink-0 place-items-center rounded-[10px]",b.T`); `reference/scripts/07-0sh4hmvdp3dcu.js` at character 11341 (`pointer-events-none`: `aria-hidden":!0}),h>0?(0,t.jsx)("span",{className:"pointer-events-none absolute -right-0.5 -top-0.5 grid h-4 min-w-4 pla`).

### 9. `g > line` answers to the pointer

- `x1` `635.7931034482758` → `260.62068965517244` over 10 frames, easing 0.293 a frame.

### 10. `g > line` answers to the pointer

- `x2` `635.7931034482758` → `260.62068965517244` over 10 frames, easing 0.293 a frame.

### 11. `g > g:nth-of-type(1) > circle:nth-of-type(1)` answers to the pointer

- `cx` `635.7931034482758` → `260.62068965517244` over 10 frames, easing 0.293 a frame.

### 12. `g > g:nth-of-type(1) > circle:nth-of-type(1)` answers to the pointer

- `cy` `64.6531852` → `194.6628832` over 10 frames, easing 0.265 a frame.

### 13. `g > g:nth-of-type(1) > circle:nth-of-type(2)` answers to the pointer

- `cx` `635.7931034482758` → `260.62068965517244` over 10 frames, easing 0.293 a frame.

## The page's own code

The scripts the page ran are in `reference/scripts/` (18 files), so you can read exactly how each effect is made. Don't paste them in whole: rebuild each effect in the project's own code, following the recipe and the source together.
