# Theme Spec — Vercel / Geist Visual Foundation

This is the shared visual contract for the Client Portal frontend. It is
**dark-first**: `.dark` is the primary, optimized target (true near-black page,
cards that read via a hairline border, not a shadow). Light mode is clean and
fully functional but secondary.

**Golden rule for downstream agents:** never write raw hex or raw Tailwind
grays (`bg-gray-800`, `text-slate-400`, `border-neutral-700`, …) in pages or
layouts. Always use the semantic tokens and component primitives documented
here so light/dark stays a one-place change. Status/priority colors come from
`<StatusBadge>` / `<PriorityBadge>`. Danger red (`red-500/600`) is the one
allowed literal palette.

---

## 1. Fonts

Real Geist webfonts are installed and wired up (no fallback was needed).

- **Package:** `@fontsource-variable/geist@^5.2.9` and
  `@fontsource-variable/geist-mono@^5.2.8` (variable weight 100–900).
- **Imported in** `src/main.tsx` (before `./index.css`).
- **Family names exposed by the packages** (already set in `tailwind.config.js`):
  - Sans → `Geist Variable` → use Tailwind `font-sans` (this is the default on
    `<body>`, so you rarely need to write it).
  - Mono → `Geist Mono Variable` → use Tailwind `font-mono`.

**Where to apply `font-mono`** (this mono-for-data detail is a big part of the
Vercel feel): numeric metrics, counts, IDs / tokens / slugs, dates,
percentages, budgets / currency, durations, version numbers, and any tabular
data. Pair it with `tabular-nums` so figures align. Everything else is
`font-sans`.

---

## 2. Tokens

Defined as `R G B` triplets in `src/index.css` and mapped to Tailwind color
utilities in `tailwind.config.js` via `rgb(var(--x) / <alpha-value>)`.

| Tailwind class stem | CSS var | Light (`:root`) | Dark (`.dark`) — hero | Purpose |
|---|---|---|---|---|
| `app` | `--color-app-bg` | `#fafafa` | `#0a0a0a` | Page background |
| `surface` | `--color-surface` | `#ffffff` | `#111111` | Card / panel background |
| `surface-alt` | `--color-surface-alt` | `#f5f5f5` | `#171717` | Input fill, table stripe, faint pill fill |
| `surface-hover` | `--color-surface-hover` | `#f0f0f0` | `#1f1f1f` | Row / item hover, progress track |
| `border` | `--color-border` | `#eaeaea` | `#262626` | Default hairline border |
| `ink` | `--color-ink` | `#171717` | `#ededed` | Primary text (soft-white in dark, **not** pure #fff) |
| `ink-muted` | `--color-ink-muted` | `#666666` | `#a1a1a1` | Secondary / muted text |
| `ink-subtle` | `--color-ink-subtle` | `#999999` | `#666666` | Placeholder / disabled / subtle text |
| `accent` | `--color-accent` | `#0070f3` | `#3b82f6` | Sparse accent: links, focus rings, active/progress |
| `primary` | `--color-primary` | `#171717` | `#ededed` | Inverted-ink CTA fill (the white Vercel button) |
| `primary-fg` | `--color-primary-fg` | `#fafafa` | `#0a0a0a` | Text on the primary CTA |

**Brand / accent scale** (`brand-50` … `brand-900`, Vercel blue centered on
`brand-500 = #0070f3`). This is now only a sparse accent scale; prefer the
`accent` token for links and focus. Reach for `brand-*` only when you need a
specific step of blue.

Use color utilities like: `bg-app`, `bg-surface`, `bg-surface-alt`,
`hover:bg-surface-hover`, `border-border`, `text-ink`, `text-ink-muted`,
`text-ink-subtle`, `text-accent`, `bg-accent`, `focus:ring-accent`,
`focus-visible:outline-accent`, `bg-primary text-primary-fg`.

### Radius & elevation
- Controls (buttons, inputs, selects, textareas, badges' non-full corners): `rounded-md` (**6px**).
- Cards, panels, modals: `rounded-xl` (**12px**).
- Pills / avatars: `rounded-full`.
- **No drop shadows on cards** — `shadow-card` is `none`. The only elevation is
  `shadow-overlay` (soft), reserved for floating panels (modals). Separate
  surfaces with `border border-border`, never a shadow.

---

## 3. Default theme

`src/contexts/ThemeContext.tsx` defaults to **dark** when there is no persisted
preference (it does not follow `prefers-color-scheme`). The `useTheme()` toggle
and `localStorage` persistence still work; light mode is fully functional.

---

## 4. Copy-pasteable recipes

Prefer the component primitives from `@/components/ui`. Raw class strings are
given for the cases where a primitive does not exist (nav, tables, page shell).

### Page / section container
```tsx
<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <div className="space-y-6">{/* sections */}</div>
</div>
```
Page title block:
```tsx
<div>
  <h1 className="text-xl font-semibold tracking-tight text-ink">Projects</h1>
  <p className="mt-1 text-sm text-ink-muted">Manage and track delivery.</p>
</div>
```

### Card  → use `<Card>`, `<CardHeader>`, `<CardBody>`
Raw equivalent:
```tsx
<div className="rounded-xl border border-border bg-surface">
  {/* header */}
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
    <h2 className="text-base font-semibold text-ink">Title</h2>
  </div>
  {/* body */}
  <div className="px-5 py-4">…</div>
</div>
```

### Buttons  → use `<Button variant="primary|secondary|danger|ghost" size="sm|md">`
Raw equivalents (only if you cannot use the component):
- Primary (signature Vercel CTA):
  `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-fg hover:opacity-90 transition-colors`
- Secondary:
  `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-transparent text-ink-muted border border-border hover:bg-surface-hover hover:text-ink transition-colors`
- Danger:
  `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors`

### Status pill  → use `<StatusBadge status={…} />` / `<PriorityBadge priority={…} />`
Raw neutral pill:
```tsx
<span className="inline-flex items-center rounded-full border border-border bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-ink-muted">
  Draft
</span>
```
Tinted variant (low-saturation): swap to
`bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400`
(also `emerald`, `amber`, `orange`, `red`).

### Muted label
```tsx
<p className="text-sm text-ink-muted">Secondary text</p>
```
Small caps eyebrow / field label:
```tsx
<p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Owner</p>
```

### Stat / metric number (mono)  → use `<StatCard label value />`
Raw number:
```tsx
<p className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-ink">
  1,284
</p>
```

### Nav item (sidebar)  — no primitive; use these strings
Default:
```tsx
<a className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors">
  <Icon className="h-4 w-4" /> Projects
</a>
```
Active (subtle filled pill — faint surface + hairline border + soft-white text,
**not** a bright brand bar):
```tsx
<a className="flex items-center gap-2 rounded-md border border-border bg-surface-alt px-3 py-2 text-sm font-medium text-ink">
  <Icon className="h-4 w-4" /> Projects
</a>
```

### Input  → use `<Input>`, `<TextArea>`, `<Select>`
Raw equivalent:
```tsx
<input className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
```

### Table
```tsx
<div className="overflow-x-auto rounded-xl border border-border">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-surface-alt">
        <th className="px-4 py-2.5 text-left text-xs font-medium text-ink-muted">Name</th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-muted">Budget</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
        <td className="px-4 py-3 text-ink">Acme redesign</td>
        <td className="px-4 py-3 text-right font-mono tabular-nums text-ink">$42,000</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Links & focus
- Link: `text-accent hover:underline`.
- Focus ring on controls: `focus:outline-none focus:ring-1 focus:ring-accent`
  (inputs) or `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` (buttons — already baked into `<Button>`).

---

## 5. File ownership

### Owned by the theme-foundation agent (DO NOT edit these — restyle wave must not collide)
- `tailwind.config.js`
- `src/index.css`
- `src/main.tsx`
- `src/contexts/ThemeContext.tsx`
- Every file under `src/components/ui/`: `Button.tsx`, `Card.tsx`, `Modal.tsx`,
  `ConfirmDialog.tsx`, `Input.tsx`, `TextArea.tsx`, `Select.tsx`,
  `ProgressBar.tsx`, `StatusBadge.tsx`, `PriorityBadge.tsx`, `Spinner.tsx`,
  `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `Pagination.tsx`,
  `StatCard.tsx`, `index.ts`
- `THEME_SPEC.md` (this file)
- `package.json` / `package-lock.json` (font dependency only)

### Open for the downstream restyle wave
Everything else — `src/App.tsx`, all `src/pages/**`, `src/layouts/**` (nav /
sidebar / topbar), `src/contexts/AuthContext.tsx`, and any feature components
outside `src/components/ui/`. Restyle those using the tokens, primitives, and
recipes above.
