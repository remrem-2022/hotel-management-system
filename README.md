# Hotel Management System

A comprehensive, mobile-first hotel management system built with Next.js 15, TypeScript, and Framer Motion. All data is stored locally using IndexedDB - no backend required.

## Features

- **Mobile-First Design**: Optimized for touch interactions with smooth animations and transitions
- **Local-Only Storage**: All data persists on the device using IndexedDB (Dexie)
- **Secure Authentication**: Local authentication with PBKDF2 password hashing
- **Role-Based Access**: Admin and Staff roles with different permissions
- **Complete CRUD Operations**: Manage rooms, bookings, and users
- **Rich Animations**: Framer Motion-powered transitions and micro-interactions
- **Dark Mode**: System-aware theme switching
- **Data Export/Import**: Backup and restore your data as JSON
- **Audit Logging**: Track all important actions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Database**: IndexedDB (Dexie)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## Project Structure

```
hotel-management-mobile/
├── app/                      # Next.js App Router
│   ├── (app)/               # Authenticated routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── rooms/           # Rooms module
│   │   ├── bookings/        # Bookings module
│   │   ├── users/           # Users module (admin)
│   │   └── settings/        # Settings page
│   ├── auth/                # Authentication pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page (redirects)
│   ├── providers.tsx        # Client-side providers
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── layout/              # Layout components
├── models/                  # Data models and Zod schemas
├── services/                # Data access layer
├── store/                   # Zustand stores
├── utils/                   # Utility functions
└── public/                  # Static assets
```

## Data Models

### User
- Email, password (hashed), name, role (admin/staff)
- Passwords hashed using PBKDF2 with SHA-256
- Session management with expiry

### Room
- Room number, type (Single/Double/Suite/Deluxe)
- Capacity, price per night
- Status (Available/Occupied/Maintenance)
- Amenities, photos (optional), notes

### Booking
- Guest name, contact
- Room ID, check-in/check-out dates
- Status (Reserved/Checked-in/Checked-out/Cancelled)
- Payment status (Unpaid/Partial/Paid)
- Total cost (auto-calculated), paid amount

### Settings
- Theme preference (light/dark/system)

### Audit Log
- User ID, action, entity type, timestamp
- Tracks all important operations

## Local Authentication

### How It Works

1. **Registration**: Users create an account with email and password
2. **Password Hashing**: Passwords are hashed using PBKDF2 with 100,000 iterations
3. **Session Management**: Sessions stored in IndexedDB with expiry
4. **Role-Based Access**: Admin users have access to user management

### Security Features

- No plaintext passwords stored
- PBKDF2 with SHA-256 for password hashing
- Session tokens with configurable expiry
- "Remember me" option for extended sessions
- Automatic session cleanup on expiry

## Data Persistence

### IndexedDB Structure

- **users**: User accounts and credentials
- **rooms**: Room inventory
- **bookings**: Reservations and bookings
- **sessions**: Active user sessions
- **settings**: App settings
- **auditLogs**: Activity logs

### Export/Import

Export your data to JSON format for backup:
- Navigate to Settings
- Click "Export Data"
- Save the JSON file

Import data from a backup:
- Navigate to Settings
- Click "Import Data"
- Select your JSON backup file

## Route Transitions

Implemented using Framer Motion with App Router compatibility:

- **Page Transitions**: Smooth fade and slide animations
- **List Animations**: Staggered entrance for list items
- **Modal/Sheet**: Slide-in animations for modals and bottom sheets
- **Interactive Elements**: Scale and hover effects for cards

## Default Credentials

The app comes with pre-seeded data including:

**Admin Account**
- Email: admin@example.com
- Password: Admin123!

**Staff Account**
- Email: staff@example.com
- Password: Staff123!

## Modules

### Dashboard
- Occupancy statistics
- Today's check-ins/check-outs
- Upcoming bookings
- Revenue overview

### Rooms
- List, create, edit, delete rooms
- Filter by status, type, capacity, price
- View room details and amenities
- Prevent deletion of rooms with active bookings

### Bookings
- Create and manage reservations
- Check-in/check-out functionality
- Payment tracking
- Date conflict validation
- Filter by status, date range, guest

### Users (Admin Only)
- Create and manage user accounts
- Assign roles (Admin/Staff)
- View user list with search
- Prevent deletion of last admin

### Settings
- Theme toggle (light/dark/system)
- Export/import data
- Reset all data
- About information

## Mobile-First Features

- **Bottom Navigation**: Easy thumb-reach navigation
- **Drawer Menu**: Full menu with logout
- **Touch Optimized**: 44px minimum touch targets
- **Swipe Gestures**: Swipe to close bottom sheets
- **Responsive Cards**: Optimized for mobile viewing
- **Large Fonts**: Readable on small screens

## Performance

- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Components loaded on demand
- **Optimized Animations**: GPU-accelerated with Framer Motion
- **IndexedDB**: Fast local database access
- **No Network Requests**: Instant responses

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- IndexedDB
- Web Crypto API
- ES2020+ JavaScript features

## License

MIT

## Contributing

This is a demo project. Feel free to fork and modify for your needs.

## Support

For issues or questions, please file an issue on the GitHub repository.
