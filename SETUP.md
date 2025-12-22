# 🔧 Detailed Setup Guide

This guide walks you through setting up Google SSO step-by-step, from Google Cloud Console configuration to deploying your application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [OAuth Consent Screen Configuration](#oauth-consent-screen-configuration)
4. [Creating OAuth Credentials](#creating-oauth-credentials)
5. [Configuring Your Application](#configuring-your-application)
6. [Local Development Setup](#local-development-setup)
7. [Production Deployment](#production-deployment)
8. [Testing Your Implementation](#testing-your-implementation)
9. [Common Configuration Scenarios](#common-configuration-scenarios)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A Google account
- [ ] A web server or hosting solution (for production)
- [ ] Basic understanding of HTML/JavaScript
- [ ] A text editor (VS Code, Sublime, etc.)

---

## Google Cloud Console Setup

### Step 1: Access Google Cloud Console

1. Navigate to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the Terms of Service if prompted

### Step 2: Create a New Project

1. Click the project dropdown at the top of the page
2. Click **"New Project"** in the popup
3. Enter your project details:
   - **Project name**: `My SSO Application` (or your preferred name)
   - **Organization**: Select your organization (or leave as "No organization")
   - **Location**: Your organization folder (if applicable)
4. Click **"Create"**
5. Wait for the project to be created (usually 10-30 seconds)
6. Select your new project from the dropdown

### Step 3: Enable Required APIs

1. From the hamburger menu (☰), go to **APIs & Services** → **Library**
2. Search for **"Google Identity"**
3. Click on **"Google Identity Services"** (or **"Google Identity Toolkit API"**)
4. Click **"Enable"**
5. Wait for the API to be enabled

---

## OAuth Consent Screen Configuration

Before creating credentials, you must configure the OAuth consent screen.

### Step 1: Access Consent Screen Settings

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **User Type**:
   - **Internal**: Only users within your Google Workspace organization (recommended for internal tools)
   - **External**: Any Google account user (required for public applications)
3. Click **"Create"**

### Step 2: Configure App Information

Fill in the required fields:

```
App name: Your Application Name
User support email: your-email@domain.com
App logo: (Optional) Upload a logo (120x120px recommended)
```

### Step 3: Add App Domains

```
Application home page: https://your-domain.com
Application privacy policy link: https://your-domain.com/privacy
Application terms of service link: https://your-domain.com/terms
```

For local development, you can leave these blank or use placeholder URLs.

### Step 4: Developer Contact Information

```
Developer contact email: your-email@domain.com
```

### Step 5: Add Scopes (Optional)

For basic SSO, you don't need to add additional scopes. The default scopes (email, profile, openid) are sufficient.

If you need additional permissions:
1. Click **"Add or Remove Scopes"**
2. Select the scopes you need
3. Click **"Update"**

### Step 6: Test Users (External Apps Only)

If you selected "External" and your app is in testing mode:
1. Click **"Add Users"**
2. Enter email addresses of test users
3. Click **"Add"**

Note: While in testing mode, only listed test users can authenticate.

### Step 7: Review and Submit

1. Review all information
2. Click **"Save and Continue"** through all sections
3. Return to the dashboard

---

## Creating OAuth Credentials

### Step 1: Access Credentials Page

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** at the top
3. Select **"OAuth 2.0 Client IDs"**

### Step 2: Configure OAuth Client

1. **Application type**: Select **"Web application"**
2. **Name**: Enter a descriptive name (e.g., "My App Web Client")

### Step 3: Add Authorized JavaScript Origins

This is the most important step. Add ALL origins where your app will run:

**For Local Development:**
```
http://localhost:8080
http://localhost:3000
http://127.0.0.1:8080
```

**For Production:**
```
https://your-domain.com
https://www.your-domain.com
```

**Important Notes:**
- Must use exact URLs (no wildcards)
- HTTP is only allowed for localhost
- Production must use HTTPS
- No trailing slashes

### Step 4: Create and Save

1. Click **"Create"**
2. A popup will show your credentials:
   - **Client ID**: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: (Not needed for this implementation)
3. Copy the **Client ID**
4. Click **"OK"**

---

## Configuring Your Application

### Step 1: Update auth-config.js

Open `auth-config.js` and replace the placeholder Client ID:

```javascript
window.AUTH_CONFIG = {
    // Paste your Client ID here
    GOOGLE_CLIENT_ID: 'xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
    
    // Add admin emails
    ADMIN_EMAILS: [
        'your-email@yourdomain.com',
    ],
    
    // Add corporate domains
    CORPORATE_DOMAINS: [
        'yourdomain.com',
    ],
    
    // Configure features
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: true,
        REQUIRE_APPROVAL: false,
        DEFAULT_ROLE: 'viewer',
    }
};
```

### Step 2: Verify Configuration

Double-check:
- [ ] Client ID is correct and complete
- [ ] Admin emails are correct
- [ ] Corporate domains match your organization
- [ ] Feature flags match your requirements

---

## Local Development Setup

### Option 1: Python HTTP Server (Recommended)

```bash
# Navigate to your project directory
cd /path/to/google-sso-implementation

# Start the server on port 8080
python3 -m http.server 8080

# Or for Python 2
python -m SimpleHTTPServer 8080
```

### Option 2: Node.js with serve

```bash
# Install serve globally
npm install -g serve

# Start the server
serve -p 8080
```

### Option 3: PHP Built-in Server

```bash
php -S localhost:8080
```

### Option 4: VS Code Live Server

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Verify Local Setup

1. Open `http://localhost:8080` in your browser
2. Click "Sign in with Google"
3. Complete the Google sign-in flow
4. Verify you're redirected back and logged in

---

## Production Deployment

### Static Hosting Options

This implementation works with any static hosting:

- **Netlify**: Drag and drop the folder
- **Vercel**: `vercel deploy`
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: Upload files to bucket
- **Google Cloud Storage**: Upload files to bucket
- **Firebase Hosting**: `firebase deploy`

### Deployment Checklist

Before deploying to production:

- [ ] Client ID is configured correctly
- [ ] Production domain added to Authorized JavaScript Origins
- [ ] HTTPS is enabled (required for production)
- [ ] OAuth consent screen is configured
- [ ] App is published (for external access)

### Example: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Example: GitHub Pages

1. Create a repository on GitHub
2. Push your code
3. Go to Settings → Pages
4. Select source branch
5. Add your GitHub Pages URL to Google Console

---

## Testing Your Implementation

### Test Scenarios

1. **Basic Sign-In**
   - Click "Sign in with Google"
   - Verify successful authentication
   - Check user info displayed correctly

2. **Admin Access**
   - Sign in with an admin email
   - Verify admin badge appears
   - Click admin button (if implemented)

3. **Corporate Domain**
   - Sign in with corporate email
   - Verify corporate badge
   - Check team access enabled

4. **Personal Email**
   - Sign in with Gmail/Yahoo/etc.
   - Verify personal badge
   - Check appropriate permissions

5. **Sign Out**
   - Click logout button
   - Verify login modal appears
   - Check session cleared

### Debug Mode

Add `?demo=user@example.com` to URL for quick testing without Google:

```
http://localhost:8080?demo=admin@yourcompany.com
http://localhost:8080?demo=user@gmail.com
```

### Console Debugging

Open browser console (F12) to see authentication logs:

```
[GSS] Initializing Google SSO module
[GSS] Received Google response
[GSS] Processing login for: user@example.com
[GSS] Login successful: user@example.com (viewer)
```

---

## Common Configuration Scenarios

### Scenario 1: Internal Corporate Tool

Only allow corporate domain users:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id',
    ADMIN_EMAILS: ['it-admin@company.com'],
    CORPORATE_DOMAINS: ['company.com', 'subsidiary.com'],
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,  // Block personal emails
        REQUIRE_APPROVAL: false,
        DEFAULT_ROLE: 'editor',  // All users can edit
    }
};
```

### Scenario 2: Public Application

Allow anyone to sign in:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id',
    ADMIN_EMAILS: ['admin@yourcompany.com'],
    CORPORATE_DOMAINS: [],  // No special domains
    FEATURES: {
        TEAM_SHARING_ENABLED: false,  // Individual accounts
        PERSONAL_USERS_ENABLED: true,
        REQUIRE_APPROVAL: false,
        DEFAULT_ROLE: 'viewer',  // Read-only by default
    }
};
```

### Scenario 3: Controlled Access with Approval

Require admin approval for new users:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id',
    ADMIN_EMAILS: ['admin@company.com', 'manager@company.com'],
    CORPORATE_DOMAINS: ['company.com'],
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: true,
        REQUIRE_APPROVAL: true,  // Admin must approve
        DEFAULT_ROLE: 'viewer',
    }
};
```

### Scenario 4: Multi-Tenant SaaS

Multiple corporate domains with different teams:

```javascript
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id',
    ADMIN_EMAILS: ['superadmin@yourplatform.com'],
    CORPORATE_DOMAINS: [
        'client1.com',
        'client2.com',
        'client3.com',
    ],
    FEATURES: {
        TEAM_SHARING_ENABLED: true,  // Teams isolated by domain
        PERSONAL_USERS_ENABLED: false,
        REQUIRE_APPROVAL: false,
        DEFAULT_ROLE: 'viewer',
    }
};
```

---

## Next Steps

1. **Customize UI**: Modify `index.html` and styles for your brand
2. **Add Admin Dashboard**: Implement full admin functionality
3. **Backend Integration**: Add server-side JWT verification for sensitive operations
4. **Monitoring**: Set up analytics and error tracking

---

## Support

- 📧 Email: john@itallstartedwithaidea.com
- 🐛 Issues: [GitHub Issues](https://github.com/itallstartedwithaidea/google-sso-implementation/issues)
- 📖 Documentation: [README.md](README.md)

