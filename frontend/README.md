# TATT Membership Frontend

Frontend project for The African Think Tank membership platform.

## Stack

- Next.js 16 (App Router + Turbopack)
- TypeScript (strict mode)
- Tailwind CSS v4 (design tokens + dark mode)
- Atomic design structure

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` (or `http://localhost:3001` if `3000` is occupied).

## Atomic Design Structure

All UI components live in `src/components`:

- `atoms/`
- `molecules/`
- `organisms/`
- `templates/`
- `pages/`

The root route (`src/app/page.tsx`) renders `HomePage`, which composes from template → organism → molecule → atoms.
