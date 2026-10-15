# Wedding Proposal Generator

## Overview

The Wedding Planning System is a full-stack application that provides couples with everything they need to plan and manage their wedding efficiently. From finding the perfect venue to managing guest lists and tracking expenses, our platform streamlines the entire wedding planning process.

## Key Features

### Core Planning Tools
- **Dashboard Overview**: Comprehensive wedding dashboard with real-time metrics, timeline tracking, and quick actions
- **Venue Management**: Search, compare, and book wedding venues with detailed amenities and availability
- **Vendor Marketplace**: Connect with and manage wedding vendors (photographers, caterers, florists, etc.)
- **Guest Management**: Complete guest list with RSVP tracking, meal preferences, and seating arrangements
- **Budget Tracking**: Monitor expenses, set budget categories, and track spending against allocated amounts
- **Timeline Planning**: Create and manage wedding planning timeline with milestones and deadlines
- **Task Management**: Organize wedding-related tasks with priorities, due dates, and completion tracking

### Digital Experience
- **Wedding Cards**: Create and customize digital wedding invitation cards with multiple templates
- **Wedding Website Builder**: Build personalized wedding websites with couple stories, photo galleries, and event information
- **Photo Gallery**: Upload and organize wedding photos with sharing capabilities
- **Invitation Builder**: Design custom invitations with advanced editing tools

### Advanced Features
- **Subscription Plans**: Multiple pricing tiers (Starter, Professional, Premium) with different feature sets
- **Settings & Preferences**: User customization options for themes, language, currency, and timezone
- **Real-time Updates**: Live dashboard updates and activity tracking
- **Mobile Responsive**: Fully responsive design for optimal mobile experience

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glass-morphism design
- **State Management**: Zustand store
- **Animations**: Framer Motion
- **Data Fetching**: SWR for GET requests, React Query for mutations
- **HTTP Client**: Axios with interceptors
- **Validation**: Zod schema validation

### Backend (Django)
- **Framework**: Django REST Framework
- **Database**: PostgreSQL with comprehensive relational schema
- **Authentication**: JWT-based authentication
- **API Design**: RESTful APIs with proper error handling
- **File Storage**: Media management for photos and documents

### Database Schema
The system uses a comprehensive database structure with entities for:
- **Users & Roles**: Multi-role system (bride, groom, guardian, admin)
- **Weddings**: Core wedding information and status tracking
- **Venues**: Venue catalog with amenities and booking management
- **Vendors**: Vendor marketplace with categories and ratings
- **Guests**: Guest lists with RSVP status and meal preferences
- **Budget**: Expense tracking with categories and payment status
- **Timeline**: Event planning with milestones and deadlines
- **Tasks**: Task management with priorities and completion tracking

## Frontend Structure

### Dashboard Pages
- `/dashboard` - Main dashboard with overview metrics and quick actions
- `/dashboard/venues` - Venue search, filtering, and booking
- `/dashboard/vendors` - Vendor marketplace and management
- `/dashboard/guests` - Guest list management (list, RSVP, meals, seating)
- `/dashboard/budget` - Expense tracking and budget management
- `/dashboard/timeline` - Wedding planning timeline and milestones
- `/dashboard/tasks` - Task management and to-do lists
- `/dashboard/packages` - Subscription plans and pricing
- `/dashboard/settings` - User preferences and configuration

### Creative Tools
- `/dashboard/wedding-cards` - Digital wedding card creation
- `/dashboard/invitation-builder` - Advanced invitation design tools
- `/dashboard/gallery` - Photo management and sharing
- `/dashboard/preview` - Wedding website preview

## Current Status

### Version Information
- **Frontend**: v0.6.0
- **Backend**: v1.3.0
- **Production Tag**: v0.6.0-prod

### Development Status
- Core dashboard functionality implemented
- Venue and vendor management systems active
- Guest management with RSVP tracking
- Budget and expense tracking
- Timeline and task management
- Digital wedding cards and invitation builder
- Wedding website builder
- Photo gallery system
- Subscription management
- Mobile responsive design

### Database Features
- Comprehensive user management with role-based access
- Wedding entity management with status tracking
- Venue catalog with amenities and booking system
- Vendor marketplace with categories and ratings
- Guest management with RSVP and meal preferences
- Budget tracking with expense categorization
- Timeline management with event scheduling
- Task management with priorities and deadlines
- Settings and preferences management

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis (for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harman8815/wedding-project.git
   cd wedding-project
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

4. **Environment Variables**
   - `NEXT_PUBLIC_API_URL` - Backend API URL
   - Database connection settings
   - JWT secret keys

## Documentation

- **ER Diagram**: `backend/docs/ER-Diagram.md`
- **API Documentation**: Available in backend docs
- **Frontend Components**: Documented in component files

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support and questions, please open an issue in the repository.

---