# VibeApps Directory

A public directory of "vibecoding" app builders and AI-assisted development tools. This is the **free community edition** available for anyone to use, learn from, and remix.

## 🌟 What is VibeApps?

VibeApps is a transparent, community-driven directory that helps developers discover and compare AI-powered development tools. Features include:

- **Anonymous Voting System**: Rate tools without creating an account
- **Comprehensive Filtering**: Search by category, pricing, features, and complexity
- **Detailed Tool Profiles**: In-depth information about each platform
- **Transparent Rankings**: Score-based system using community votes
- **Tamper-Resistant**: Fingerprint-based voting to prevent manipulation

## 🚀 Live Demo

Visit the live application: https://vibelist.lovable.app/

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Deployment**: Lovable Cloud
- **Payments**: Stripe integration for premium features

## 📋 Features

### For Visitors
- Browse and search development tools
- Filter by multiple criteria (category, pricing, features, etc.)
- Vote on tools anonymously
- View detailed tool information and ratings

### For Tool Owners
- Submit new tools for listing
- Propose paid edits to existing listings
- Track ratings and feedback

### For Admins
- Review and approve submissions
- Moderate content
- Manage product listings

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route pages (Index, ProductDetail, etc.)
├── integrations/    # Supabase client and types
├── utils/           # Helper functions
└── hooks/           # Custom React hooks

supabase/
├── functions/       # Edge functions (voting, submissions, etc.)
└── migrations/      # Database migrations
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (or use the included Lovable Cloud setup)

### Local Development

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Copy `.env` and update with your Supabase credentials if needed.

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

5. **Open your browser**
Navigate to `http://localhost:8080`

## 🗄️ Database Setup

The database schema is managed through Supabase migrations. Key tables:

- `products` - Tool listings and metadata
- `votes` - Anonymous voting records with fingerprinting
- `edit_proposals` - Paid edit submissions from tool owners
- `payments` - Stripe payment tracking

RLS (Row Level Security) policies are in place to ensure data security.

## 🎨 Customization

The design system uses semantic tokens defined in:
- `src/index.css` - CSS custom properties and global styles
- `tailwind.config.ts` - Tailwind configuration and theme

## 📦 Deployment

### Deploy on Lovable
1. Visit [Lovable](https://lovable.dev/projects/039d3103-4174-487f-aa66-f265baf20f8c)
2. Click Share → Publish
3. Your app will be live at `<project-name>.lovable.app`
4. Optional: Connect a custom domain in Project > Settings > Domains

### Deploy Elsewhere
The code is standard React/Vite and can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting platform

## 🤝 Contributing

This is the community edition! Feel free to:
- Fork and remix this project
- Submit issues and suggestions
- Learn from the code
- Build your own version

## 📝 Editing This Project

**Use Lovable**

Visit the [Lovable Project](https://lovable.dev/projects/039d3103-4174-487f-aa66-f265baf20f8c) and start prompting. Changes made via Lovable will be committed automatically to this repo.

**Use Your Preferred IDE**

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Use GitHub Codespaces**

Click the "Code" button → "Codespaces" tab → "New codespace" to launch a cloud development environment.

## 📄 License

This community edition is open for remixing and learning.

## 🔗 Related Links

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Product Requirements Document](prd/VibeApps_PRD-2.md)

## 💎 Premium Version

A premium version with advanced features is available separately. This community edition will continue to be maintained and available for free.

## 🙏 Acknowledgments

Built with [Lovable](https://lovable.dev) - The AI-powered web app builder.

---

**Note**: This is the free community edition of VibeApps, available for anyone to use and remix.
