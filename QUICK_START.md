# Quick Start Guide

## What's Been Set Up

✅ **Firebase Infrastructure** - Complete
- Authentication system
- Firestore database structure
- Cloud Functions for server-side logic
- Security rules and indexes

✅ **Project Structure** - Complete
- TypeScript types
- Service functions
- Context providers

## What You Need to Do

### Step 1: Get Firebase Configuration (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "lightning-league")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Services (5 minutes)

**Authentication:**
1. Click "Authentication" in left menu
2. Click "Get started"
3. Enable "Email/Password"
4. Click "Save"

**Firestore:**
1. Click "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location (closest to users)
5. Click "Enable"

**Functions:**
1. Click "Functions"
2. Click "Get started"
3. Follow wizard (requires billing account)
4. Note: Free tier is generous for MVP

### Step 3: Get Config Values (2 minutes)

1. Click gear icon (⚙️) > Project Settings
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app: "Lightning League"
5. Copy the config values

### Step 4: Create .env File (1 minute)

In project root, create `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 5: Install & Deploy (10 minutes)

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Login to Firebase
firebase login

# Initialize Firebase (select your project)
firebase init
# Select: Firestore, Functions, Hosting

# Deploy rules and functions
firebase deploy --only firestore:rules,firestore:indexes,functions
```

### Step 6: Run the App

```bash
npm run dev
```

Open http://localhost:5173

## Testing

1. **Create Coach Account:**
   - Click "OPTIONS" on start screen
   - Password: `admin`
   - You'll need to add sign-up flow (currently prototype)

2. **Create Questions:**
   - Use Coach Dashboard
   - Import CSV or create manually

3. **Test Practice Mode:**
   - Select player
   - Choose settings
   - Start practice

## Current Status

### ✅ Ready to Use
- Firebase backend infrastructure
- Database structure
- Security rules
- Cloud Functions
- Type definitions

### 🚧 Needs Frontend Integration
- App.tsx still uses prototype (local state)
- Needs Firebase service integration
- Authentication UI needs to be added
- Real-time features need implementation

## Next Development Steps

1. **Add Authentication UI**
   - Sign up form
   - Sign in form
   - Role selection

2. **Integrate Firebase Services**
   - Update App.tsx to use Firestore
   - Replace local state with Firebase
   - Add real-time listeners

3. **Add Analytics**
   - Install Recharts
   - Create graph components
   - Connect to Firestore data

4. **Test & Deploy**
   - Test all features
   - Fix bugs
   - Deploy to production

## Troubleshooting

**"Configuration not found"**
- Check `.env` file exists
- Restart dev server after creating `.env`

**"Permission denied"**
- Deploy rules: `firebase deploy --only firestore:rules`
- Check user is authenticated

**Functions not working**
- Deploy functions: `firebase deploy --only functions`
- Check billing is enabled
- Check function logs in Firebase Console

## Support Files

- `SETUP_INSTRUCTIONS.md` - Detailed setup
- `IMPLEMENTATION_STATUS.md` - What's done/what's needed
- `README.md` - Project overview

## Questions?

Check:
1. Firebase Console for errors
2. Browser console for client errors
3. Function logs: `firebase functions:log`









