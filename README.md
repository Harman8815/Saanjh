Here’s a cleaner, more professional, and structured rewrite of your README:

---

# Wedding Planning System

## Overview

The Wedding Planning System is a full-stack application designed to simplify and streamline the entire wedding planning process. It provides couples with a centralized platform to manage venues, vendors, guests, budgets, and digital experiences—ensuring efficient planning from start to finish.

---

## Features

### Planning & Management

* **Dashboard**
  Centralized overview with real-time insights, key metrics, and quick actions.

* **Venue Management**
  Search, compare, and manage venue bookings with detailed availability and amenities.

* **Vendor Marketplace**
  Discover and manage vendors such as photographers, caterers, and decorators.

* **Guest Management**
  Maintain guest lists with RSVP tracking, meal preferences, and seating arrangements.

* **Budget Tracking**
  Monitor expenses, define budget categories, and track spending against allocations.

* **Timeline Planning**
  Plan events with milestones, deadlines, and structured scheduling.

* **Task Management**
  Organize tasks with priorities, due dates, and completion tracking.

---

### Digital Experience

* **Wedding Invitations**
  Create and customize digital invitation cards using predefined templates.

* **Wedding Website Builder**
  Build personalized websites with stories, galleries, and event details.

* **Photo Gallery**
  Upload, organize, and share wedding photos.

* **Invitation Builder**
  Advanced tools for designing custom invitations.

---

### Advanced Capabilities

* **Subscription Plans**
  Tiered pricing (Starter, Professional, Premium) with feature-based access.

* **User Preferences**
  Customize themes, language, currency, and timezone.

* **Real-time Updates**
  Live data updates across the dashboard.

* **Responsive Design**
  Optimized experience across desktop and mobile devices.

---

## Architecture

### Frontend

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (custom glassmorphism UI)
* **State Management**: Zustand
* **Animations**: Framer Motion
* **Data Fetching**: SWR (GET), React Query (mutations)
* **HTTP Client**: Axios (with interceptors)
* **Validation**: Zod

---

### Backend

* **Framework**: Django REST Framework
* **Database**: PostgreSQL
* **Authentication**: JWT-based authentication
* **API Design**: RESTful architecture with structured error handling
* **Media Handling**: File storage for images and documents

---

### Database Design

The system is built on a relational schema covering:

* User roles (Bride, Groom, Guardian, Admin)
* Wedding entities and lifecycle tracking
* Venue and vendor management
* Guest lists with RSVP and preferences
* Budget and expense tracking
* Timeline and scheduling
* Task management
* User settings and preferences

---

## Application Structure

### Dashboard Routes

* `/dashboard` – Overview and analytics
* `/dashboard/venues` – Venue management
* `/dashboard/vendors` – Vendor marketplace
* `/dashboard/guests` – Guest management
* `/dashboard/budget` – Budget tracking
* `/dashboard/timeline` – Event planning
* `/dashboard/tasks` – Task management
* `/dashboard/packages` – Subscription plans
* `/dashboard/settings` – User configuration

---

### Creative Modules

* `/dashboard/wedding-cards` – Invitation templates
* `/dashboard/invitation-builder` – Custom invitation editor
* `/dashboard/gallery` – Photo management
* `/dashboard/preview` – Website preview

---

## Current Status

### Versions

* **Frontend**: v0.6.0
* **Backend**: v1.3.0
* **Production Tag**: v0.6.0-prod

---

### Implemented Modules

* Dashboard and analytics
* Venue and vendor systems
* Guest management with RSVP tracking
* Budget and expense tracking
* Timeline and task management
* Digital invitations and website builder
* Photo gallery system
* Subscription management
* Fully responsive UI

---

## Getting Started

### Prerequisites

* Node.js (v18 or above)
* Python (v3.9 or above)
* PostgreSQL
* Redis (optional, for caching)

---

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/Harman8815/wedding-project.git
cd wedding-project
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### Environment Variables

Configure the following:

* `NEXT_PUBLIC_API_URL` – Backend API endpoint
* Database credentials
* JWT secret keys

---

## Documentation

* ER Diagram: `backend/docs/ER-Diagram.md`
* API Documentation: Available in backend docs
* Component Documentation: Inline within frontend code

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Support

For issues, feature requests, or questions, please open an issue in the repository.

---

If you want, I can also make a **GitHub-optimized version (with badges, visuals, and better first-impression layout)** or a **minimal recruiter-friendly README**.
