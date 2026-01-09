# Firebase Authentication with Google Sign-In - Requirements Document
**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P1  
**Feature**: Firebase Authentication Integration with Google Sign-In

---

## 🎯 Overview

Integrate Firebase Authentication to enable users to sign in with Google, providing a seamless authentication experience alongside the existing email/password authentication system. This will allow users to authenticate using their Google account without needing to create and remember a separate password.

---

## 🎯 Objectives

### Primary Goals
1. **Google Sign-In**: Enable users to authenticate using their Google account
2. **Seamless Integration**: Work alongside existing email/password authentication
3. **Account Linking**: Allow users to link Google account to existing email account
4. **User Experience**: Provide quick, one-click authentication option
5. **Security**: Maintain security standards with Firebase Auth
6. **Data Consistency**: Ensure user data is consistent across auth methods

### Business Value
- **Reduced Friction**: Easier sign-up/login process increases conversions
- **User Convenience**: Users don't need to remember another password
- **Security**: Leverage Google's robust authentication security
- **User Adoption**: Lower barrier to entry for new users
- **Modern UX**: Expected feature in modern web applications

---

## 👤 User Stories

### As a New User

1. **Sign Up with Google**
   - As a new user, I want to sign up using my Google account
   - I should be able to click "Sign in with Google" and authenticate
   - My account should be created automatically with my Google email
   - I should be logged in immediately after authentication

2. **Sign In with Google**
   - As a returning user, I want to sign in using my Google account
   - I should be able to click "Sign in with Google" and authenticate
   - I should be logged in immediately if my account exists

### As an Existing User

3. **Link Google Account**
   - As an existing user with email/password, I want to link my Google account
   - I should be able to add Google authentication to my existing account
   - I should then be able to sign in with either method

4. **Unlink Google Account**
   - As a user with linked Google account, I want to unlink it if needed
   - I should be able to remove Google authentication from my account
   - I should still be able to sign in with email/password

5. **Switch Authentication Methods**
   - As a user, I want to use either Google or email/password to sign in
   - Both methods should work seamlessly
   - My account data should be the same regardless of sign-in method

---

## 📋 Functional Requirements

### 1. Firebase Authentication Setup

#### 1.1 Firebase Project Configuration
- **Firebase Project**: Create/configure Firebase project
- **Authentication Providers**: Enable Google Sign-In provider
- **Authorized Domains**: Configure authorized domains for OAuth
- **OAuth Consent Screen**: Configure Google OAuth consent screen
- **API Keys**: Obtain Firebase API keys and configuration

#### 1.2 Frontend Firebase SDK
- **Install Firebase SDK**: Add Firebase JavaScript SDK to frontend
- **Initialize Firebase**: Configure Firebase with API keys
- **Firebase Auth**: Initialize Firebase Authentication
- **Google Provider**: Configure Google Sign-In provider

#### 1.3 Backend Firebase Admin SDK
- **Install Firebase Admin SDK**: Add Firebase Admin SDK to backend
- **Service Account**: Configure Firebase service account credentials
- **Token Verification**: Implement Firebase ID token verification
- **User Management**: Handle Firebase user data in backend

### 2. Google Sign-In Flow

#### 2.1 Sign Up with Google
- **Trigger**: User clicks "Sign in with Google" button
- **Google OAuth Flow**: 
  1. User redirected to Google sign-in
  2. User selects Google account
  3. User grants permissions
  4. Redirected back to app with ID token
- **Account Creation**:
  - Verify Firebase ID token on backend
  - Extract user info (email, name, photo)
  - Check if user exists (by email)
  - If new user: Create account in database
  - If existing user: Link Google account or sign in
- **Session Creation**:
  - Create backend JWT token
  - Store token in localStorage
  - Update auth context
  - Redirect to dashboard

#### 2.2 Sign In with Google
- **Trigger**: User clicks "Sign in with Google" button
- **Google OAuth Flow**: Same as sign up
- **Account Lookup**:
  - Verify Firebase ID token on backend
  - Find user by email or Firebase UID
  - If user found: Sign in
  - If user not found: Offer to create account or link
- **Session Creation**: Same as sign up

#### 2.3 Error Handling
- **Google Sign-In Errors**:
  - User cancels sign-in
  - Network errors
  - Invalid credentials
  - Account already linked to different user
- **User Feedback**: Clear error messages
- **Fallback**: Option to use email/password instead

### 3. Account Linking

#### 3.1 Link Google to Existing Account
- **Trigger**: User with email/password account wants to add Google
- **Flow**:
  1. User signs in with email/password
  2. User navigates to account settings
  3. User clicks "Link Google Account"
  4. Google OAuth flow
  5. Backend verifies token and links accounts
  6. Store Firebase UID in user record
- **Validation**:
  - Check if Google account already linked to another user
  - Prevent duplicate account linking
  - Verify user is authenticated

#### 3.2 Unlink Google Account
- **Trigger**: User wants to remove Google authentication
- **Flow**:
  1. User navigates to account settings
  2. User clicks "Unlink Google Account"
  3. Confirm action
  4. Remove Firebase UID from user record
  5. User can still sign in with email/password
- **Validation**:
  - Ensure user has at least one auth method
  - Prevent unlinking if it's the only auth method
  - Require password confirmation

#### 3.3 Account Merging
- **Scenario**: User signs in with Google, but email already exists
- **Options**:
  1. **Link Accounts**: Link Google to existing account (requires password verification)
  2. **Create New Account**: Create separate account (warn about duplicate email)
  3. **Sign In**: Sign in to existing account (requires password)
- **User Choice**: Present options clearly to user

### 4. User Data Management

#### 4.1 User Model Updates
- **Firebase UID**: Store Firebase user ID
- **Auth Provider**: Track authentication method (email, google, both)
- **Google Data**: Store Google profile data (name, photo URL)
- **Last Sign-In Method**: Track which method was used last

#### 4.2 Profile Data Sync
- **Google Profile**: 
  - Name from Google account
  - Profile photo from Google
  - Email from Google (must match)
- **Update Logic**:
  - On first Google sign-in: Use Google data
  - On subsequent sign-ins: Optionally update profile
  - Allow user to override profile data
- **Data Consistency**: Ensure email matches across auth methods

#### 4.3 Username Handling
- **Google Sign-In**: Google doesn't provide username
- **Generation**: Auto-generate username from email or name
- **Customization**: Allow user to set custom username
- **Validation**: Ensure username uniqueness

### 5. Authentication UI

#### 5.1 Login Page Updates
- **Google Sign-In Button**: 
  - Prominent "Sign in with Google" button
  - Google branding/icon
  - Positioned alongside email/password form
- **Divider**: Visual separator between Google and email/password
- **Options**: "Or sign in with email" text/link

#### 5.2 Register Page Updates
- **Google Sign-Up Button**: Same as login page
- **Quick Sign-Up**: Emphasize ease of Google sign-up
- **Email Option**: Still allow email/password registration

#### 5.3 Account Settings
- **Linked Accounts Section**:
  - Show current auth methods
  - "Link Google Account" button (if not linked)
  - "Unlink Google Account" button (if linked)
  - Status indicators
- **Profile Sync**: Option to sync profile from Google

### 6. Backend Integration

#### 6.1 Firebase Token Verification
- **Endpoint**: `POST /api/auth/firebase/verify`
- **Input**: Firebase ID token
- **Process**:
  1. Verify token with Firebase Admin SDK
  2. Extract user info (UID, email, name)
  3. Check if user exists
  4. Create or update user
  5. Return backend JWT token
- **Response**: Backend JWT token for API authentication

#### 6.2 Account Linking Endpoints
- **Link Google**: `POST /api/auth/link-google`
  - Input: Firebase ID token
  - Process: Link Google account to current user
  - Validation: Check for duplicates
  
- **Unlink Google**: `DELETE /api/auth/unlink-google`
  - Process: Remove Google link from account
  - Validation: Ensure other auth method exists

#### 6.3 User Lookup
- **By Email**: Find user by email (for account linking)
- **By Firebase UID**: Find user by Firebase UID
- **By Both**: Support both lookup methods

### 7. Security Requirements

#### 7.1 Token Security
- **Firebase ID Token**: Verify on backend (never trust client)
- **Backend JWT**: Use existing JWT system for API auth
- **Token Expiry**: Handle token expiration gracefully
- **Token Refresh**: Implement token refresh if needed

#### 7.2 Account Security
- **Email Verification**: Ensure email is verified with Google
- **Duplicate Prevention**: Prevent linking same Google account to multiple users
- **Account Takeover Prevention**: Verify ownership when linking accounts
- **Session Management**: Secure session handling

#### 7.3 Data Privacy
- **Google Permissions**: Request minimal permissions
- **Data Storage**: Store only necessary Google data
- **GDPR Compliance**: Handle user data according to privacy regulations
- **User Consent**: Clear consent for Google sign-in

---

## 🔒 Technical Requirements

### Backend

#### Database Schema Updates

```python
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = None  # Optional for Google users
    username: str = Field(unique=True, index=True)
    
    # Firebase Authentication
    firebase_uid: Optional[str] = Field(default=None, unique=True, index=True)
    auth_provider: str = Field(default="email")  # "email", "google", "both"
    google_email: Optional[str] = None  # Google account email
    google_name: Optional[str] = None  # Google display name
    google_photo_url: Optional[str] = None  # Google profile photo
    
    # Existing fields...
    fpl_team_id: Optional[int] = Field(default=None, index=True)
    favorite_team_id: Optional[int] = Field(default=None, index=True)
    is_active: bool = Field(default=True)
    is_premium: bool = Field(default=False)
    role: Optional[str] = Field(default="user")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### API Endpoints

1. **Verify Firebase Token**
   - `POST /api/auth/firebase/verify`
   - Body: `{ "id_token": string }`
   - Response: `{ "access_token": string, "user": UserRead }`
   - Process:
     - Verify Firebase ID token
     - Find or create user
     - Return backend JWT token

2. **Link Google Account**
   - `POST /api/auth/link-google`
   - Body: `{ "id_token": string }`
   - Response: `{ "success": bool, "message": string }`
   - Requires: Authenticated user (email/password)
   - Process:
     - Verify Firebase ID token
     - Check for duplicate accounts
     - Link Google account to current user

3. **Unlink Google Account**
   - `DELETE /api/auth/unlink-google`
   - Response: `{ "success": bool, "message": string }`
   - Requires: Authenticated user
   - Validation: Ensure other auth method exists
   - Process: Remove Firebase UID and Google data

4. **Get Auth Methods**
   - `GET /api/auth/methods`
   - Response: `{ "methods": ["email", "google"], "can_unlink": bool }`
   - Shows available auth methods for current user

#### Firebase Admin Service

```python
from firebase_admin import auth, credentials, initialize_app
import firebase_admin

class FirebaseAuthService:
    """Service for Firebase authentication"""
    
    def __init__(self):
        if not firebase_admin._apps:
            # Initialize Firebase Admin SDK
            cred = credentials.Certificate("path/to/serviceAccountKey.json")
            initialize_app(cred)
    
    async def verify_id_token(self, id_token: str) -> dict:
        """Verify Firebase ID token and return decoded token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase token: {str(e)}"
            )
    
    async def get_user_info(self, id_token: str) -> dict:
        """Get user info from Firebase token"""
        decoded_token = await self.verify_id_token(id_token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "photo_url": decoded_token.get("picture"),
            "email_verified": decoded_token.get("email_verified", False)
        }
```

#### Dependencies
- `firebase-admin`: Firebase Admin SDK for Python
- Service account key file (stored securely, not in repo)

### Frontend

#### Firebase SDK Setup

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

#### Google Sign-In Function

```typescript
// lib/firebase-auth.ts
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { authApi } from './api';

export async function signInWithGoogle(): Promise<void> {
  try {
    // Sign in with Google using Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Send token to backend for verification
    const response = await authApi.verifyFirebaseToken(idToken);
    
    // Store backend JWT token
    localStorage.setItem('token', response.access_token);
    
    // Update auth context
    // Redirect to dashboard
  } catch (error) {
    // Handle errors
    throw error;
  }
}
```

#### Components

1. **GoogleSignInButton Component**
   - Button with Google branding
   - Handles click and triggers sign-in
   - Loading state during authentication
   - Error handling

2. **AccountSettings Component Updates**
   - Show linked accounts
   - Link/unlink Google account buttons
   - Status indicators

#### API Integration
- Add methods to `api.ts`:
  - `verifyFirebaseToken(idToken)`
  - `linkGoogleAccount(idToken)`
  - `unlinkGoogleAccount()`
  - `getAuthMethods()`

#### Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Configuration

#### Firebase Console Setup
1. **Create Firebase Project** (or use existing)
2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Configure OAuth consent screen
   - Add authorized domains
3. **Get Configuration**:
   - Project Settings > General
   - Copy Firebase config (API keys)
4. **Service Account**:
   - Project Settings > Service Accounts
   - Generate new private key
   - Download JSON file (store securely)

#### OAuth Consent Screen
- **Application Name**: Fotmate / Fantasy Football
- **User Support Email**: Support email
- **Authorized Domains**: 
  - Production domain
  - Localhost (for development)
- **Scopes**: email, profile, openid

---

## ✅ Acceptance Criteria

### Google Sign-In
- ✅ User can sign up with Google account
- ✅ User can sign in with Google account
- ✅ Google OAuth flow works correctly
- ✅ User is logged in after Google authentication
- ✅ User data is created/updated correctly
- ✅ Profile data (name, photo) is synced from Google

### Account Linking
- ✅ User can link Google account to existing email account
- ✅ User can unlink Google account
- ✅ User cannot unlink if it's the only auth method
- ✅ Duplicate account linking is prevented
- ✅ Account merging works correctly

### Integration
- ✅ Google sign-in works alongside email/password
- ✅ User can switch between auth methods
- ✅ Backend JWT tokens work for both auth methods
- ✅ Existing users are not affected

### Security
- ✅ Firebase ID tokens are verified on backend
- ✅ No security vulnerabilities introduced
- ✅ Account takeover is prevented
- ✅ Email verification is checked

### User Experience
- ✅ Google sign-in button is prominent and clear
- ✅ Loading states are shown during authentication
- ✅ Error messages are clear and helpful
- ✅ Mobile-friendly Google sign-in flow

---

## 🚀 Implementation Phases

### Phase 1: MVP - Basic Google Sign-In
- Firebase project setup
- Frontend Firebase SDK integration
- Backend Firebase Admin SDK integration
- Basic Google sign-in flow (sign up/sign in)
- User creation from Google account

### Phase 2: Account Linking
- Link Google to existing account
- Unlink Google account
- Account merging logic
- Auth methods display

### Phase 3: Enhanced Features
- Profile photo sync
- Username generation/selection
- Account settings UI
- Error handling improvements

### Phase 4: Polish & Testing
- Comprehensive error handling
- Mobile optimization
- Security audit
- User testing

---

## 📝 Notes

- **Password Optional**: Users with Google auth don't need password
- **Email Consistency**: Ensure email matches across auth methods
- **Username Generation**: Auto-generate or prompt for username
- **Profile Photos**: Use Google profile photos if available
- **Migration**: Existing users unaffected, can optionally link Google
- **Security**: Always verify Firebase tokens on backend
- **Error Handling**: Graceful fallback to email/password

---

## 🎯 Success Metrics

### Adoption Metrics
- % of new sign-ups using Google
- % of logins using Google
- Time to sign up (should decrease)

### User Experience
- Sign-up completion rate
- Login success rate
- User satisfaction with auth flow

### Business Metrics
- User acquisition increase
- Reduced support tickets for password issues
- User retention (easier login = more logins)

---

## 📚 Related Features

- User Authentication (existing)
- User Profile
- Account Settings
- Password Reset (for email users)

---

**Document Status**: ✅ Requirements Complete  
**Next**: Create UI Designer handoff document
