# Backend Setup for Claude AI Integration

This guide will help you set up a backend proxy server to properly use Claude AI without CORS issues.

## Quick Setup Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### 3. Keep Both Servers Running
- **Backend**: `http://localhost:3001` (handles Claude API calls)
- **Frontend**: `http://localhost:5183` (your React app)

## How It Works

The search functionality now uses a **3-tier fallback system**:

1. **Backend API** (Best) - Uses official Claude SDK without CORS issues
2. **Direct Claude API** (Fallback) - Direct browser calls (may fail due to CORS)
3. **Mock Recommendations** (Final Fallback) - Always works offline

## Testing the Setup

1. **Start the backend**: `cd backend && npm run dev`
2. **Test the backend**: Visit `http://localhost:3001/health`
3. **Use the search**: The frontend will automatically detect and use the backend

## Success Indicators

- Console shows: `✅ Backend is healthy, using backend API`
- Search results are powered by real Claude AI
- No CORS errors in browser console

## If Backend Isn't Working

The app will automatically fall back to mock recommendations, so users always get results.

## Benefits of Backend Approach

- ✅ **No CORS issues** - Server-to-server API calls work perfectly
- ✅ **Better security** - API key hidden on server
- ✅ **Official SDK** - Uses Anthropic's official Node.js SDK
- ✅ **Production ready** - Can be deployed to any hosting service
- ✅ **Automatic fallback** - Still works if backend is down

## Optional: Environment Variables

The backend uses the same API key from your `.env` file. Make sure both files have:

```
CLAUDE_API_KEY=your_api_key_here
```

## Deployment Options

For production, you can deploy the backend to:
- **Vercel** (with serverless functions)
- **Railway** (container deployment)
- **Heroku** (traditional hosting)
- **Digital Ocean** (VPS hosting)

The frontend will continue to work with fallbacks even if backend deployment fails.