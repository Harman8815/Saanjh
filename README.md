# Wedding Proposal Generator 💍

A full-stack web application for creating personalized and beautiful wedding proposals with multiple styles and customization options.

## 🌟 Overview

The Wedding Proposal Generator is a modern web application that helps users create the perfect marriage proposal. Whether you're planning a romantic surprise, a funny moment, or a poetic declaration, this app provides beautifully crafted proposal templates that can be personalized with your names and preferred style.

## 🏗️ Architecture

This is a **full-stack application** with a clear separation of concerns:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express.js API
- **Deployment**: Ready for production with modern web standards

## ✨ Features

### 🎨 Multiple Proposal Styles
- **Romantic**: Heartfelt and passionate proposals
- **Funny**: Lighthearted and humorous approaches
- **Poetic**: Beautiful rhyming verses
- **Simple**: Sweet and straightforward messages

### 🚀 Modern Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, RESTful API
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript implementation

### 🎯 User Experience
- Beautiful, intuitive interface
- Real-time proposal generation
- Smooth animations and transitions
- Mobile-optimized design
- Instant preview of generated proposals

## 📁 Project Structure

```
wedding-project/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utilities and API clients
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── README.md           # Frontend-specific documentation
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harman8815/wedding-project.git
   cd wedding-project
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm start
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev    # Development with nodemon
npm start      # Production server
```

### Frontend Development
```bash
cd frontend
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
```

## 📡 API Endpoints

- `POST /api/generate-proposal` - Generate personalized proposal
- `GET /api/styles` - Get available proposal styles

## 🌐 Deployment

### Frontend (Vercel - Recommended)
1. Connect frontend folder to Vercel
2. Deploy automatically on push

### Backend (Heroku/Railway/Render)
1. Deploy backend folder to your preferred platform
2. Configure environment variables
3. Update frontend API endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💝 Made with Love

Created to help people express their love in the most beautiful way possible. Every proposal generated is unique and special, just like your love story.

---

**🎉 Ready to create the perfect proposal? Get started now!**
