# E-commerce Platform

A full-featured e-commerce platform built with Next.js, TypeScript, and Supabase.

## Features

- 🛍️ Multi-vendor marketplace
- 👥 User authentication and authorization
- 🏪 Shop management for business owners
- 📦 Inventory and order management
- 🚚 Rider/delivery management
- ⭐ Product reviews and ratings
- 💬 Messaging system
- 📊 Analytics dashboard
- 🔔 Notifications and announcements
- 👨‍💼 Admin panel with comprehensive controls

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Authentication:** Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- pnpm (recommended) or npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Ecommerce
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Ecommerce/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication routes
│   ├── (business)/        # Business dashboard routes
│   ├── (customer)/        # Customer routes
│   └── (public)/          # Public routes
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── public/                # Static assets

```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## License

All rights reserved.
