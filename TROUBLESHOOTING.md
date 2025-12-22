# 🔍 Troubleshooting Guide

This guide covers common issues and their solutions when implementing Google SSO.

---

## Table of Contents

1. [Google Sign-In Button Issues](#google-sign-in-button-issues)
2. [Authentication Errors](#authentication-errors)
3. [Session Issues](#session-issues)
4. [Permission Problems](#permission-problems)
5. [Domain Detection Issues](#domain-detection-issues)
6. [Console Errors](#console-errors)
7. [Browser-Specific Issues](#browser-specific-issues)
8. [Debugging Tools](#debugging-tools)

---

## Google Sign-In Button Issues

### Button Not Appearing

**Symptoms:**
- Empty space where button should be
- Button container exists but is empty

**Solutions:**

1. **Check script loading:**
   ```html
   <!-- Verify this script is in your HTML head -->
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```

2. **Verify container element exists:**
   ```html
   <div id="google-signin-container"></div>
   ```

3. **Check Client ID:**
   ```javascript
   // Ensure this is not the placeholder value
   GOOGLE_CLIENT_ID: 'actual-client-id.apps.googleusercontent.com'
   ```

4. **Check console for errors:**
   - Open Developer Tools (F12)
   - Look for red error messages
   - Check Network tab for failed requests

5. **Ad blockers:**
   - Some ad blockers block Google scripts
   - Temporarily disable and test

### Button Appears But Doesn't Work

**Symptoms:**
- Button visible but clicking does nothing
- No popup appears

**Solutions:**

1. **Popup blockers:**
   - Allow popups for your domain
   - Try Ctrl/Cmd + Click to force popup

2. **Check console for errors:**
   ```
   [GSS] Google Client ID not configured. Using demo mode.
   ```
   This means your Client ID is still the placeholder.

3. **Verify JavaScript origins:**
   - Go to Google Cloud Console
   - Check Authorized JavaScript Origins
   - Ensure your exact URL is listed

---

## Authentication Errors

### "idpiframe_initialization_failed"

**Cause:** Third-party cookies blocked

**Solutions:**

1. **Enable third-party cookies:**
   - Chrome: Settings → Privacy → Cookies → Allow all cookies
   - Firefox: Settings → Privacy → Custom → Uncheck "Cookies"

2. **FedCM Migration:**
   - Google is moving to FedCM which doesn't require third-party cookies
   - Ensure you're using the latest Google Identity Services

3. **Incognito mode:**
   - Some browsers block all cookies in incognito
   - Test in normal mode

### "popup_closed_by_user"

**Cause:** User closed popup before completing sign-in

**Solution:** Handle gracefully:
```javascript
window.addEventListener('gss:error', (e) => {
    if (e.detail.type === 'popup_closed') {
        console.log('User cancelled sign-in');
        // Don't show error, just return to login state
    }
});
```

### "Invalid client_id"

**Cause:** Client ID mismatch

**Solutions:**

1. **Verify Client ID format:**
   ```
   Correct: 123456789-abcdef.apps.googleusercontent.com
   Wrong: 123456789-abcdef (missing suffix)
   Wrong: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com (placeholder)
   ```

2. **Copy directly from Google Console:**
   - Go to APIs & Services → Credentials
   - Click on your OAuth client
   - Copy the Client ID directly

### "origin_mismatch"

**Cause:** Current URL not in Authorized JavaScript Origins

**Solutions:**

1. **Add your domain:**
   - Go to Google Cloud Console
   - APIs & Services → Credentials
   - Edit your OAuth client
   - Add exact URL under "Authorized JavaScript origins"

2. **Common URL mistakes:**
   ```
   Wrong: http://localhost:8080/  (trailing slash)
   Right: http://localhost:8080
   
   Wrong: http://www.example.com (if accessing via example.com)
   Right: Both http://example.com AND http://www.example.com
   
   Wrong: http://example.com (in production)
   Right: https://example.com (HTTPS required)
   ```

3. **Wait for propagation:**
   - Changes can take 5-30 minutes to propagate
   - Try clearing browser cache

### "access_denied"

**Cause:** User denied access or app not authorized

**Solutions:**

1. **External apps in testing mode:**
   - Add user to test users list
   - Or publish the app

2. **User revoked access:**
   - User can re-grant by signing in again

3. **Organization restrictions:**
   - Google Workspace admins may restrict third-party apps
   - Contact your IT department

---

## Session Issues

### Session Not Persisting

**Symptoms:**
- User logged out after page refresh
- Login required every time

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('gss_user_session'));
   ```

2. **Storage quota:**
   - Clear other data to free space
   - Check for storage errors in console

3. **Private browsing:**
   - Sessions don't persist in private/incognito mode

4. **Browser settings:**
   - Some browsers clear localStorage on close
   - Check browser privacy settings

### Session Data Corrupted

**Symptoms:**
- JavaScript errors on page load
- Strange user info displayed

**Solution:**
```javascript
// Clear all SSO data
localStorage.removeItem('gss_user_session');
localStorage.removeItem('gss_admin_settings');
localStorage.removeItem('gss_managed_users');
localStorage.removeItem('gss_user_activity');

// Or use the API
GoogleSSO.clearSession();
```

### Wrong User Showing

**Symptoms:**
- Different Google account than expected
- Can't switch accounts

**Solutions:**

1. **Sign out and back in:**
   ```javascript
   GoogleSSO.signOut({ reload: true });
   ```

2. **Clear Google's auto-select:**
   - Sign out from all Google accounts
   - Or use the account chooser

3. **Force account selection:**
   ```javascript
   GoogleSSO.initGoogleSignIn({
       autoSelect: false  // Always show account chooser
   });
   ```

---

## Permission Problems

### User Has Wrong Role

**Symptoms:**
- User should be admin but isn't
- Permissions don't match expectations

**Solutions:**

1. **Check ADMIN_EMAILS:**
   ```javascript
   // Emails must be exact match (case-insensitive)
   ADMIN_EMAILS: [
       'admin@company.com',  // ✓
       'Admin@Company.com',  // ✓ (case doesn't matter)
       'admin@company.com ', // ✗ (trailing space!)
   ]
   ```

2. **Check managed user role:**
   ```javascript
   // In console
   console.log(GoogleSSO.getManagedUser('user@example.com'));
   ```

3. **Reset user role:**
   ```javascript
   GoogleSSO.setUserRole('user@example.com', 'admin');
   ```

### Team Access Not Working

**Symptoms:**
- Corporate users can't see team content
- Team features disabled

**Solutions:**

1. **Check domain configuration:**
   ```javascript
   // Verify domain is in CORPORATE_DOMAINS
   CORPORATE_DOMAINS: ['company.com']
   
   // User email: user@company.com ✓
   // User email: user@company.co.uk ✗ (different domain)
   ```

2. **Check feature flag:**
   ```javascript
   FEATURES: {
       TEAM_SHARING_ENABLED: true  // Must be true
   }
   ```

3. **Check user's canAccessTeam:**
   ```javascript
   const session = GoogleSSO.getSession();
   console.log('Can access team:', session.canAccessTeam);
   ```

---

## Domain Detection Issues

### Wrong User Type

**Symptoms:**
- Corporate user showing as personal
- Personal user showing as corporate

**Solutions:**

1. **Check domain lists:**
   ```javascript
   // Personal domains are built-in, check CORPORATE_DOMAINS
   console.log(GoogleSSO.isCorporateDomain('example.com'));
   console.log(GoogleSSO.isPersonalDomain('gmail.com'));
   ```

2. **Unknown domains:**
   - By default, unknown domains are treated as corporate
   - Add to appropriate list if needed

3. **Subdomain issues:**
   ```javascript
   // These are different domains:
   'company.com'
   'mail.company.com'  // Not automatically included
   'subdomain.company.com'  // Not automatically included
   ```

---

## Console Errors

### "Cannot read property 'id' of undefined"

**Cause:** Google Identity Services not loaded

**Solution:**
```javascript
// Wait for Google to load
if (typeof google !== 'undefined' && google.accounts) {
    GoogleSSO.init();
} else {
    window.addEventListener('load', () => {
        setTimeout(() => GoogleSSO.init(), 500);
    });
}
```

### "gss:error - blocked"

**Cause:** User is on blocked list

**Solution:**
```javascript
// Check if user is blocked
console.log(GoogleSSO.isBlocked('user@example.com'));

// Remove from blocked list (as admin)
const settings = GoogleSSO.getSettings();
settings.blockedEmails = settings.blockedEmails.filter(e => e !== 'user@example.com');
GoogleSSO.saveSettings(settings);
```

### "QuotaExceededError"

**Cause:** localStorage full

**Solutions:**

1. **Clear old data:**
   ```javascript
   GoogleSSO.clearActivityLog();
   ```

2. **Check storage usage:**
   ```javascript
   let total = 0;
   for (let key in localStorage) {
       if (localStorage.hasOwnProperty(key)) {
           total += localStorage[key].length;
       }
   }
   console.log('localStorage usage:', (total / 1024).toFixed(2), 'KB');
   ```

---

## Browser-Specific Issues

### Safari Issues

1. **Private browsing:**
   - localStorage disabled by default
   - Inform users to use normal mode

2. **Intelligent Tracking Prevention:**
   - May block Google cookies
   - Users may need to allow cookies for Google

### Firefox Issues

1. **Enhanced Tracking Protection:**
   - May block Google scripts
   - Add exception for your domain

2. **Container tabs:**
   - Sessions isolated per container
   - Ensure consistency

### Chrome Issues

1. **Third-party cookie deprecation:**
   - Google is migrating to FedCM
   - Keep implementation updated

2. **Extensions:**
   - Privacy extensions may interfere
   - Test with extensions disabled

---

## Debugging Tools

### Enable Verbose Logging

```javascript
// Add to your code
window.GSS_DEBUG = true;

// All operations will now log to console
```

### Check Current State

```javascript
// View current session
console.log('Session:', GoogleSSO.getSession());

// View settings
console.log('Settings:', GoogleSSO.getSettings());

// View managed users
console.log('Users:', GoogleSSO.getManagedUsers());

// View recent activity
console.log('Activity:', GoogleSSO.getActivityLog({ limit: 10 }));
```

### Test Specific Functions

```javascript
// Test domain detection
console.log('Is corporate:', GoogleSSO.isCorporateDomain('company.com'));
console.log('Is personal:', GoogleSSO.isPersonalDomain('gmail.com'));

// Test permissions
console.log('Has permission:', GoogleSSO.hasPermission('upload'));

// Test user type
console.log('User type:', GoogleSSO.getUserType('user@company.com'));
```

### Export Debug Information

```javascript
// Export all data for support
const debugData = {
    session: GoogleSSO.getSession(),
    settings: GoogleSSO.getSettings(),
    users: GoogleSSO.getManagedUsers(),
    activity: GoogleSSO.getActivityLog({ limit: 50 }),
    config: GoogleSSO.getConfig(),
    userAgent: navigator.userAgent,
    url: window.location.href
};

console.log(JSON.stringify(debugData, null, 2));
```

---

## Getting Help

If you've tried everything above and still have issues:

1. **Check GitHub Issues:** Someone may have solved your problem
2. **Create an Issue:** Include debug information
3. **Email Support:** john@itallstartedwithaidea.com

When reporting issues, include:
- Browser and version
- Error messages (exact text)
- Console output
- Steps to reproduce
- Debug information (exported above)

