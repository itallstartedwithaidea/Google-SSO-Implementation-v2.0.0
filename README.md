# 🔐 Google SSO Implementation Guide

## Enterprise-Grade Single Sign-On for Web Applications

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google OAuth 2.0](https://img.shields.io/badge/OAuth-Google%202.0-4285F4?logo=google)](https://developers.google.com/identity)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A complete, production-ready implementation of Google Single Sign-On (SSO) for web applications. This implementation includes user management, role-based access control (RBAC), corporate domain detection, activity logging, and a full admin dashboard.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Architecture](#-architecture)
3. [Features](#-features)
4. [Quick Start](#-quick-start)
5. [Google Cloud Setup](#-google-cloud-setup)
6. [Implementation Details](#-implementation-details)
7. [Configuration Options](#-configuration-options)
8. [Role-Based Access Control](#-role-based-access-control)
9. [Admin Dashboard](#-admin-dashboard)
10. [Security Considerations](#-security-considerations)
11. [Troubleshooting](#-troubleshooting)
12. [API Reference](#-api-reference)
13. [Contributing](#-contributing)
14. [License](#-license)

---

## 🎯 Overview

This Google SSO implementation provides:

- **Zero Backend Required** - Client-side only implementation using Google Identity Services
- **Corporate/Personal Domain Detection** - Automatically identifies corporate users for team features
- **Role-Based Access Control** - Admin, Editor, and Viewer roles with granular permissions
- **Full Admin Dashboard** - Manage users, domains, settings, and view activity logs
- **Session Persistence** - Users stay logged in across browser sessions
- **Activity Logging** - Complete audit trail of user actions

### Why This Implementation?

| Feature | Basic OAuth | This Implementation |
|---------|-------------|---------------------|
| Google Sign-In | ✅ | ✅ |
| Session Persistence | ❌ | ✅ |
| Role-Based Access | ❌ | ✅ |
| Corporate Domain Detection | ❌ | ✅ |
| User Management Dashboard | ❌ | ✅ |
| Activity Logging | ❌ | ✅ |
| Domain Blocking | ❌ | ✅ |
| Settings Export/Import | ❌ | ✅ |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Google    │───▶│   Auth      │───▶│   Application       │  │
│  │   Identity  │    │   Module    │    │   (Your App)        │  │
│  │   Services  │◀───│             │◀───│                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                 │                      │              │
│         │                 │                      │              │
│         ▼                 ▼                      ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Google    │    │ localStorage│    │    IndexedDB        │  │
│  │   Accounts  │    │ - Session   │    │    - User Data      │  │
│  │   Server    │    │ - Settings  │    │    - App Data       │  │
│  └─────────────┘    │ - Activity  │    └─────────────────────┘  │
│                     │ - Users     │                             │
│                     └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User clicks "Sign in with Google"** → Opens Google OAuth popup
2. **Google authenticates user** → Returns JWT credential
3. **JWT decoded client-side** → Extract email, name, picture
4. **Domain analysis** → Determine user type (admin/corporate/personal)
5. **Role assignment** → Based on email and settings
6. **Session created** → Stored in localStorage
7. **UI updated** → Show user info and appropriate features

---

## ✨ Features

### 🔑 Authentication
- One-click Google Sign-In
- Auto-sign-in for returning users
- Secure JWT token handling
- Demo mode for testing without Google credentials

### 👥 User Management
- Add/remove users manually
- Block specific users or entire domains
- Change user roles dynamically
- View login history and stats

### 🏢 Domain Management
- Configure corporate domains for team access
- Personal email detection (Gmail, Yahoo, etc.)
- Domain-based team isolation
- Block unwanted domains

### 📊 Activity Logging
- Login/logout tracking
- Role change history
- Setting modifications
- Export logs as CSV

### ⚙️ Admin Dashboard
- Real-time user statistics
- Role permissions matrix
- Setting toggles
- Import/export configuration

---

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/itallstartedwithaidea/google-sso-implementation.git
cd google-sso-implementation
```

### 2. Configure

Edit `auth-config.js`:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
    ADMIN_EMAILS: ['admin@yourcompany.com'],
    CORPORATE_DOMAINS: ['yourcompany.com'],
};
```

### 3. Run Locally

```bash
# Python 3
python3 -m http.server 8080

# Node.js (with serve package)
npx serve -p 8080

# PHP
php -S localhost:8080
```

### 4. Open Browser

Navigate to `http://localhost:8080`

---

## ☁️ Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name → **Create**

### Step 2: Enable the API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Identity"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public apps) or **Internal** (for organization only)
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
4. Click **Save and Continue**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Add **Authorized JavaScript origins**:
   - For local testing: `http://localhost:8080`
   - For production: `https://yourdomain.com`
5. Click **Create**
6. Copy the **Client ID**

### Step 5: Add Client ID to Your App

```javascript
// auth-config.js
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_COPIED_CLIENT_ID.apps.googleusercontent.com',
    // ...
};
```

---

## 🔧 Implementation Details

### File Structure

```
google-sso-implementation/
├── index.html              # Main HTML with auth UI
├── auth-config.js          # Configuration file
├── auth.js                 # Core authentication module
├── admin-dashboard.js      # Admin dashboard functionality
├── styles.css              # Styling
├── README.md               # This documentation
├── SETUP.md                # Detailed setup guide
├── TROUBLESHOOTING.md      # Common issues and solutions
└── examples/
    ├── basic-integration/  # Minimal example
    ├── full-featured/      # Complete implementation
    └── wordpress/          # WordPress plugin version
```

### Core Components

#### 1. Google Identity Services Integration

```html
<!-- Load Google Identity Services -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### 2. Initialize Sign-In

```javascript
google.accounts.id.initialize({
    client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    callback: handleGoogleResponse,
    auto_select: true  // Auto-sign-in returning users
});

// Render the button
google.accounts.id.renderButton(
    document.getElementById('google-signin-container'),
    { 
        theme: 'outline', 
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular'
    }
);

// Prompt One Tap sign-in
google.accounts.id.prompt();
```

#### 3. Handle Response & Decode JWT

```javascript
function handleGoogleResponse(response) {
    const payload = decodeJWT(response.credential);
    if (payload) {
        processLogin(payload.email, payload.name, payload.picture, payload.sub);
    }
}

function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => 
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
}
```

#### 4. User Type Detection

```javascript
const PERSONAL_DOMAINS = [
    'gmail.com', 'googlemail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
    'yahoo.com', 'ymail.com',
    'aol.com', 'protonmail.com', 'icloud.com', 'me.com',
    'mail.com', 'zoho.com', 'gmx.com'
];

function getUserType(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        return 'admin';
    }
    if (CORPORATE_DOMAINS.includes(domain)) {
        return 'corporate';
    }
    if (PERSONAL_DOMAINS.includes(domain)) {
        return 'personal';
    }
    // Unknown domains treated as corporate
    return 'corporate';
}
```

#### 5. Session Management

```javascript
function setSession(userData) {
    const session = {
        ...userData,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };
    localStorage.setItem('user_session', JSON.stringify(session));
    logActivity('login', userData);
    return session;
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem('user_session'));
    } catch {
        return null;
    }
}

function clearSession() {
    const session = getSession();
    if (session) {
        logActivity('logout', session);
    }
    localStorage.removeItem('user_session');
}
```

---

## ⚙️ Configuration Options

### Full Configuration Reference

```javascript
window.AUTH_CONFIG = {
    // =============================================
    // GOOGLE OAUTH CLIENT ID (Required)
    // =============================================
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    
    // =============================================
    // ADMIN EMAILS
    // =============================================
    // Users with these emails get full admin access
    ADMIN_EMAILS: [
        'admin@yourcompany.com',
        'superuser@yourcompany.com',
    ],
    
    // =============================================
    // CORPORATE DOMAINS
    // =============================================
    // Users with these domains get team access
    CORPORATE_DOMAINS: [
        'yourcompany.com',
        'subsidiary.com',
    ],
    
    // =============================================
    // FEATURE FLAGS
    // =============================================
    FEATURES: {
        // Enable team sharing for corporate users
        TEAM_SHARING_ENABLED: true,
        
        // Allow personal email accounts to sign in
        PERSONAL_USERS_ENABLED: true,
        
        // Enable activity logging
        ACTIVITY_LOG_ENABLED: true,
        
        // Days to retain activity logs
        ACTIVITY_LOG_RETENTION_DAYS: 90,
        
        // Require admin approval for new users
        REQUIRE_APPROVAL: false,
        
        // Default role for new users: 'viewer' or 'editor'
        DEFAULT_ROLE: 'viewer',
    }
};
```

---

## 🔐 Role-Based Access Control

### Role Hierarchy

```
Admin (Full Access)
  ├── All Editor permissions
  ├── Delete any content
  ├── Access Admin Dashboard
  ├── Manage users
  ├── Change settings
  └── View activity logs

Editor (Create & Edit)
  ├── All Viewer permissions
  ├── Upload content
  ├── Edit content
  ├── Delete own content
  └── Access team content

Viewer (Read Only)
  ├── View content
  ├── Add to favorites
  └── Download content
```

### Permission Implementation

```javascript
function canUpload(role) {
    return role === 'admin' || role === 'editor';
}

function canEdit(role) {
    return role === 'admin' || role === 'editor';
}

function canDelete(role, ownerId, currentUserId) {
    if (role === 'admin') return true;
    if (role === 'editor' && ownerId === currentUserId) return true;
    return false;
}

function canManageUsers(role) {
    return role === 'admin';
}

function canAccessTeam(userType, role) {
    if (!settings.teamSharingEnabled) return false;
    return ['admin', 'corporate'].includes(userType) || 
           ['admin', 'editor'].includes(role);
}
```

---

## 📊 Admin Dashboard

### Features

| Tab | Description |
|-----|-------------|
| **Overview** | User statistics, recent logins |
| **Users** | Manage users, change roles, block/unblock |
| **Roles** | View permission matrix, set default role |
| **Domains** | Manage corporate, admin, and blocked domains |
| **Settings** | Toggle features, export/import config |
| **Activity** | View logs, export CSV |

### Opening the Dashboard

The Admin button appears automatically for admin users:

```javascript
if (session.role === 'admin') {
    document.getElementById('admin-btn').style.display = 'block';
}
```

---

## 🛡️ Security Considerations

### What This Implementation Does

✅ **Client-side JWT decoding** - No sensitive data exposed  
✅ **No credential storage** - Google handles all auth  
✅ **Domain validation** - Block unwanted domains  
✅ **Session invalidation** - Clean logout  
✅ **Activity logging** - Audit trail  

### What You Should Add for Production

⚠️ **Backend validation** - Verify JWT on server  
⚠️ **HTTPS only** - Never use HTTP in production  
⚠️ **Content Security Policy** - Restrict script sources  
⚠️ **Rate limiting** - Prevent abuse  
⚠️ **Server-side session** - For sensitive operations  

### Security Headers (Recommended)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://accounts.google.com; 
               frame-src https://accounts.google.com;">
```

---

## 🔍 Troubleshooting

### Common Issues

#### "idpiframe_initialization_failed"
**Cause:** Cookies disabled or third-party cookies blocked  
**Solution:** Enable cookies or use FedCM (Federated Credential Management)

#### "popup_closed_by_user"
**Cause:** User closed the popup before completing sign-in  
**Solution:** Handle gracefully with error message

#### "Invalid client_id"
**Cause:** Client ID mismatch or not configured  
**Solution:** Verify Client ID in Google Cloud Console

#### Sign-in button not appearing
**Cause:** Script not loaded or container element missing  
**Solution:** Check network tab for script load, verify container ID

### Debug Mode

Enable console logging:

```javascript
// Add to your auth initialization
console.log('[AUTH] Initializing with config:', AUTH_CONFIG);
console.log('[AUTH] Session:', getSession());
```

---

## 📚 API Reference

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `initGoogleSignIn()` | none | void | Initialize Google Sign-In |
| `handleGoogleResponse(response)` | Google response | void | Process sign-in response |
| `processLogin(email, name, picture, googleId)` | user data | void | Create session |
| `signOut()` | none | void | End session |
| `getSession()` | none | object\|null | Get current session |
| `setSession(userData)` | user object | session | Create session |
| `clearSession()` | none | void | Remove session |
| `getUserType(email)` | email string | string | Determine user type |
| `getUserRole(email)` | email string | string | Get user role |
| `isBlocked(email)` | email string | boolean | Check if blocked |
| `logActivity(action, userData, details)` | action data | void | Log activity |
| `showAdminDashboard()` | none | void | Open admin panel |

### Events

```javascript
// Custom events you can listen for
window.addEventListener('sso:login', (e) => {
    console.log('User logged in:', e.detail);
});

window.addEventListener('sso:logout', (e) => {
    console.log('User logged out');
});

window.addEventListener('sso:rolechange', (e) => {
    console.log('Role changed:', e.detail);
});
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/itallstartedwithaidea/google-sso-implementation.git

# Install dev dependencies (for testing)
npm install

# Run tests
npm test

# Build production version
npm run build
```

---

## 📄 License

MIT License - feel free to use in personal or commercial projects.

---

## 🙏 Acknowledgments

- [Google Identity Services](https://developers.google.com/identity) - OAuth provider
- [JWT.io](https://jwt.io/) - JWT debugging tool
- [itallstartedwithaidea](https://github.com/itallstartedwithaidea) - Creator

---

## 📞 Support

- 📧 Email: john@itallstartedwithaidea.com
- 🐛 Issues: [GitHub Issues](https://github.com/itallstartedwithaidea/google-sso-implementation/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/itallstartedwithaidea/google-sso-implementation/discussions)

---

Made with ❤️ by [John Williams](https://www.itallstartedwithaidea.com)

