# Installation Guide

This guide will walk you through installing, running, and building the Hotel Management System.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)

### Check Your Versions

```bash
node --version  # Should be v18.17.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### Install Node.js (if needed)

Download and install from [nodejs.org](https://nodejs.org/)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd C:\testReactTSX
```

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Dexie (IndexedDB wrapper)
- React Hook Form + Zod
- Lucide React (icons)
- And other dependencies

**Note**: Installation may take 2-5 minutes depending on your internet connection.

### 3. Verify Installation

Check that node_modules was created:

```bash
ls node_modules  # Linux/Mac
dir node_modules # Windows
```

## Running the Development Server

### Start the Server

```bash
npm run dev
```

The application will start on **http://localhost:3000**

You should see output similar to:

```
▲ Next.js 15.1.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

### Access the Application

1. Open your browser
2. Navigate to http://localhost:3000
3. You'll be redirected to the sign-in page

### Default Login Credentials

**Admin Account:**
- Email: admin@example.com
- Password: Admin123!

**Staff Account:**
- Email: staff@example.com
- Password: Staff123!

### Development Features

The development server includes:
- **Hot Module Replacement**: Changes appear instantly
- **Error Overlay**: Helpful error messages in the browser
- **Source Maps**: Debug with original source code

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

This will:
- Type-check your code
- Compile TypeScript to JavaScript
- Optimize and bundle your application
- Generate static assets
- Create the .next folder with production files

**Build time**: 1-3 minutes

### 2. Start Production Server

```bash
npm run start
```

The production server will start on **http://localhost:3000**

### Production vs Development

| Feature | Development | Production |
|---------|------------|------------|
| Build time | Instant | 1-3 minutes |
| Performance | Slower | Optimized |
| Error details | Verbose | Minimal |
| Hot reload | Yes | No |
| Code minification | No | Yes |

## Testing the Application Locally

### Test on Mobile Devices (Same Network)

1. Find your computer's local IP address:

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your active network
```

**Mac/Linux:**
```bash
ifconfig
# Look for inet address
```

2. Start the dev server:
```bash
npm run dev
```

3. On your mobile device, navigate to:
```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.100:3000`

### Test in Different Browsers

The app works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or use a different port:

```bash
PORT=3001 npm run dev
```

### Clear Cache and Rebuild

If you encounter issues:

```bash
# Delete node_modules and package-lock
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install

# Clear Next.js cache
rm -rf .next  # Mac/Linux
rmdir /s .next  # Windows

# Rebuild
npm run build
```

### IndexedDB Not Working

- Ensure you're using a modern browser
- Check browser console for errors
- Try incognito/private mode
- Clear browser data and reload

### Build Errors

Common issues and fixes:

**TypeScript errors:**
```bash
# Check for type errors
npx tsc --noEmit
```

**ESLint errors:**
```bash
npm run lint
```

**Module not found:**
```bash
npm install
```

## File Structure After Install

```
hotel-management-mobile/
├── node_modules/          # Installed dependencies (don't commit)
├── .next/                 # Build output (don't commit)
├── app/                   # Application code
├── components/            # React components
├── models/                # Data models
├── services/              # Business logic
├── store/                 # State management
├── utils/                 # Utilities
├── public/                # Static files
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
├── next.config.js         # Next.js config
└── README.md              # Documentation
```

## Environment Variables (Optional)

This app doesn't require environment variables, but you can create `.env.local` for custom configuration:

```bash
# .env.local
NEXT_PUBLIC_APP_NAME="My Hotel"
```

## Performance Optimization

### For Production

The build process automatically:
- Minifies JavaScript and CSS
- Optimizes images
- Generates static pages where possible
- Creates optimized bundles
- Enables compression

### Recommended Settings

For best performance:
1. Use production build (`npm run build && npm start`)
2. Enable HTTPS (for PWA features)
3. Use a modern browser
4. Clear browser cache regularly

## Deployment Options

This app can be deployed to:

### Static Hosting (No Server Needed)
- **Vercel** (recommended): `vercel deploy`
- **Netlify**: Drag and drop .next folder
- **GitHub Pages**: Export static site

### Self-Hosted
- **Docker**: Create Dockerfile
- **VPS**: Run with PM2 or systemd
- **Windows Server**: Use IIS with URL Rewrite

### Export Static Site (No Node.js Server)

```bash
# Add to next.config.js:
output: 'export'

# Build
npm run build

# Deploy the 'out' folder
```

## Data Management

### Backup Data

1. Sign in to the app
2. Go to Settings
3. Click "Export Data"
4. Save the JSON file

### Restore Data

1. Go to Settings
2. Click "Import Data"
3. Select your backup JSON file
4. Page will reload with restored data

### Reset Everything

Settings > Reset All Data

**Warning**: This cannot be undone!

## Development Workflow

### Making Changes

1. Edit files in `app/`, `components/`, etc.
2. Save - changes appear instantly
3. Check browser for errors
4. Test on mobile (use network IP)
5. Build before deploying

### Adding New Dependencies

```bash
npm install package-name
```

### Recommended VS Code Extensions

- ESLint
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Next Steps

1. ✅ Install dependencies
2. ✅ Run development server
3. ✅ Sign in with default credentials
4. 🎯 Explore the dashboard
5. 🎯 Create a test booking
6. 🎯 Customize the theme
7. 🎯 Export your data
8. 🎯 Build for production

## Getting Help

- Check README.md for features
- Review error messages in browser console
- Check Network tab for failed requests (there shouldn't be any!)
- Verify IndexedDB data in DevTools > Application > IndexedDB

## Quick Reference

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

Happy coding! 🚀
