# Wedding Proposal Generator - Frontend

A Next.js application for generating personalized wedding proposals.

## Overview

This is the frontend component of the Wedding Proposal Generator, built with Next.js 14, TypeScript, and Tailwind CSS. It provides a beautiful and interactive user interface for creating custom marriage proposals.

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- 💍 Multiple proposal styles (Romantic, Funny, Poetic, Simple)
- ⚡ Fast performance with Next.js App Router
- 🎯 TypeScript for type safety
- 📱 Mobile-first responsive design
- 🌟 Beautiful animations and transitions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── ProposalForm.tsx
│   │   ├── ProposalDisplay.tsx
│   │   └── Header.tsx
│   ├── lib/                 # Utilities and configurations
│   │   └── api.ts           # API client
│   └── types/               # TypeScript type definitions
│       └── proposal.ts
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## API Integration

The frontend connects to the backend API at `/api/generate-proposal` to generate personalized proposals. Make sure the backend server is running on the configured port.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

Build the application and deploy the `.next` folder:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
