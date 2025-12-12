# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

## Step 3: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (you can skip hosting setup for now)
5. Copy the Firebase configuration object

## Step 4: Add Environment Variables

1. Create a `.env.local` file in the `hangman-game` directory
2. Add your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Replace the placeholder values with your actual Firebase config values

## Step 5: Restart Development Server

After adding environment variables, restart your Next.js dev server:

```bash
npm run dev
```

## Features Implemented

✅ User registration (Sign Up)
✅ User login (Sign In)
✅ Persistent authentication (users stay logged in)
✅ Logout functionality
✅ Auth state management with React Context
✅ Error handling
✅ Guest mode (play without account)

## How It Works

- **AuthContext**: Provides authentication state and methods throughout the app
- **Persistent Login**: Uses Firebase's `onAuthStateChanged` to keep users logged in across page refreshes
- **Protected Routes**: Can be added later if needed
- **User Data**: User info (uid, email, displayName) is available via `useAuth()` hook

## Usage in Components

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, logout, loading } = useAuth();
  
  // user is null when not logged in
  // user contains { uid, email, displayName } when logged in
}
```

