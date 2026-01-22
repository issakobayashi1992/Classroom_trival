# Lightning League MVP - Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase Account** (free tier is sufficient)
3. **Firebase CLI** installed globally: `npm install -g firebase-tools`

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "lightning-league")
   - Enable Google Analytics (optional)
   - Create project

## Step 2: Enable Firebase Services

### 2.1 Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2.2 Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add rules later)
4. Select a location (choose closest to your users)
5. Click **Enable**

### 2.3 Cloud Functions
1. Go to **Functions**
2. Click **Get started**
3. Follow the setup wizard (requires billing account, but free tier includes generous limits)

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app with a nickname (e.g., "Lightning League Web")
5. Copy the `firebaseConfig` object

## Step 4: Configure Environment Variables

1. In the project root, create a `.env` file (copy from `.env.example`)
2. Fill in your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

## Step 6: Initialize Firebase CLI

1. Login to Firebase:
```bash
firebase login
```

2. Initialize Firebase in your project:
```bash
firebase init
```

Select:
- ✅ Firestore: Configure security rules and indexes files
- ✅ Functions: Configure a Cloud Functions directory
- ✅ Hosting: Configure files for Firebase Hosting

When prompted:
- Use existing project (select your project)
- For Firestore rules: use `firestore.rules`
- For Firestore indexes: use `firestore.indexes.json`
- For Functions: use `functions` directory
- For Hosting: use `dist` directory

## Step 7: Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Step 8: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:arbitrateBuzzer
```

## Step 9: Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal)

## Step 10: Create Initial Accounts

### Create a Coach Account:
1. Open the app
2. Click "OPTIONS" on the start screen
3. Enter password: `admin`
4. You'll be redirected to Coach Dashboard
5. From there, you can create teams and invite students

### Create a Student Account:
1. Coach should create a team first
2. Coach can then create student accounts and assign them to the team
3. Students can also self-register if you implement that flow

## Testing the Setup

1. **Test Authentication:**
   - Try creating a coach account
   - Try creating a student account
   - Verify login/logout works

2. **Test Firestore:**
   - Create a question in the Coach Dashboard
   - Verify it appears in Firestore Console

3. **Test Cloud Functions:**
   - Try creating a match
   - Check Functions logs in Firebase Console

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env` file exists and has correct values
- Restart the dev server after creating/updating `.env`

### "Permission denied" errors
- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is authenticated and has correct role

### Cloud Functions not working
- Check Functions logs: `firebase functions:log`
- Verify Functions are deployed: `firebase deploy --only functions`
- Check billing is enabled (required for Cloud Functions)

### Firestore indexes error
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait a few minutes for indexes to build

## Next Steps

1. Create your first team
2. Add questions (via CSV import or manual entry)
3. Test Practice Mode
4. Test Match Mode
5. Review analytics dashboards

## Production Deployment

When ready for production:

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

Your app will be available at: `https://your-project-id.web.app`

## Support

For issues or questions:
- Check Firebase Console for errors
- Review Cloud Functions logs
- Check browser console for client-side errors










