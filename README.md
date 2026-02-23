# Blooprint

Portfolio builder SaaS pour créateurs UGC. Built with Next.js 15, Craft.js, Supabase, Stripe.

## Stack Technique

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Builder:** Craft.js (drag & drop visual builder)
- **Backend:** Next.js API Routes, Supabase (PostgreSQL, Auth, Storage)
- **Billing:** Stripe (subscriptions, webhooks)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm ou pnpm
- Compte Supabase
- Compte Stripe

### Installation

```bash
# Install dependencies
npm install

# Copy env example
cp .env.example .env.local

# Fill .env.local with your credentials

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
blooprint/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Shared UI components
│   ├── features/         # Feature-based modules
│   │   ├── auth/        # Authentication
│   │   ├── builder/     # Craft.js builder
│   │   ├── portfolios/  # Portfolio management
│   │   └── billing/     # Stripe integration
│   ├── lib/             # Utilities, clients (Supabase, Stripe)
│   ├── types/           # TypeScript types
│   └── styles/          # Global styles
├── _bmad/               # BMAD agent definitions
└── _bmad-output/        # BMAD generated docs
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Mantras BMAD Appliqués

- **#7 KISS:** Simplicité avant complexité
- **#18 TDD:** Tests pour flows critiques
- **#20 Performance is Feature:** Optimisation dès Sprint 0
- **#37 Ockham:** Start simple, iterate
- **IA-3 Explain Reasoning:** Documentation des choix techniques
- **IA-16 Challenge Before Confirm:** Validation des décisions

## License

Proprietary - TOM$ 2026
