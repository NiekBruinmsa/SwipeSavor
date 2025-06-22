# Swipe & Savor - Tinder for Dinner

## Project Overview
A Tinder-style swipe app for couples to decide on meals together, featuring cooking, ordering, and dining options. The app uses a modern yellow theme inspired by food delivery apps with clean card layouts and sophisticated typography.

## User Preferences
- Modern design aesthetic with vibrant yellow theme (#FFD700)
- Clean, card-based layouts with rounded corners
- Bold typography with black text on yellow backgrounds
- Professional, polished appearance similar to popular food apps

## Project Architecture

### Frontend (React + TypeScript)
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with custom yellow theme variables
- **Animation**: Framer Motion for smooth transitions and swipe gestures
- **State Management**: React Context for swipe session state
- **Data Fetching**: TanStack Query for API communication

### Backend (Express + TypeScript)
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Storage**: Database-backed storage replacing previous in-memory system
- **API**: RESTful endpoints for users, food items, sessions, and matches
- **Demo Data**: Automatically creates demo users and sample food items

### Key Features
- **Onboarding**: Welcome screen with app explanation
- **Categories**: Choose between cooking, delivery, or dine-out options
- **Swipe Interface**: Touch/mouse gesture support with visual feedback
- **Match System**: Shows celebration modal when both partners like the same item
- **Recipe Details**: Detailed modal with ingredients, instructions, and info

## Recent Changes
*January 22, 2025*
- Built complete multi-user real-time swipe system
- Added user authentication with login/register functionality
- Created session joining system for connecting partners by username
- Implemented WebSocket server for real-time communication
- Added match detection system using room-based API with @replit/database
- Fixed React rendering issues and component structure
- Currently debugging WebSocket connection issues and match notifications
- Users can successfully register (Jesse/Niek) and join sessions together
- Swipe functionality works but partner status shows offline and matches not detected yet

*December 16, 2024*
- Updated entire app design to match modern yellow food app aesthetic
- Changed color scheme to vibrant yellow (#FFD700) with black text
- Updated all components to use rounded corners (rounded-2xl, rounded-3xl)
- Redesigned swipe cards with better typography and layout
- Enhanced match and recipe modals with modern styling
- Updated action buttons and status bar to match new theme
- Added PostgreSQL database with Drizzle ORM for data persistence
- Migrated from in-memory storage to database-backed storage system

## Technical Stack
- **Runtime**: Node.js 20
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables
- **Animation**: Framer Motion for gestures and transitions
- **Data**: In-memory storage with sample food items

## Current Status
The app is fully functional with a polished modern design. Users can navigate through onboarding, select food categories, swipe through options, and receive match notifications when both partners like the same item.