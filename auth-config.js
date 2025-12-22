/**
 * Google SSO Authentication Configuration
 * ========================================
 * 
 * This is your main configuration file for the Google SSO implementation.
 * Customize the settings below to match your application requirements.
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable "Google Identity" API
 * 4. Go to APIs & Services > Credentials
 * 5. Create Credentials > OAuth 2.0 Client ID
 * 6. Application type: Web application
 * 7. Add your domain(s) to "Authorized JavaScript origins":
 *    - For local testing: http://localhost:8080
 *    - For production: https://your-domain.com
 * 8. Copy the Client ID and paste below
 * 
 * IMPORTANT SECURITY NOTE:
 * ========================
 * This file will be publicly accessible. Do NOT include any secrets here.
 * The Google Client ID is designed to be public - it's not a secret key.
 */

window.AUTH_CONFIG = {
    
    // =============================================
    // GOOGLE OAUTH CLIENT ID (REQUIRED)
    // =============================================
    // Get this from Google Cloud Console > APIs & Services > Credentials
    // Format: xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
    // 
    // Leave as 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' for demo mode
    // (users will be prompted to enter email manually)
    
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    
    
    // =============================================
    // ADMIN EMAILS
    // =============================================
    // Users with these email addresses receive FULL admin access:
    // - Access to Admin Dashboard
    // - User management capabilities
    // - Settings configuration
    // - Activity log viewing
    // - All editor permissions
    // 
    // IMPORTANT: Use exact email addresses, lowercase recommended
    
    ADMIN_EMAILS: [
        'john@itallstartedwithaidea.com',
        // Add more admin emails here:
        // 'admin@yourcompany.com',
        // 'superuser@yourcompany.com',
    ],
    
    
    // =============================================
    // CORPORATE DOMAINS
    // =============================================
    // Users with email addresses from these domains get:
    // - Corporate user badge
    // - Team sharing access (can see/share assets within domain)
    // - Editor role by default (configurable via DEFAULT_ROLE)
    // - Isolated team workspace
    // 
    // Domain-based team isolation:
    // - user1@acme.com and user2@acme.com = SAME TEAM
    // - user@acme.com and user@other.com = DIFFERENT TEAMS
    // 
    // TIP: Add your company domain and any subsidiaries
    
    CORPORATE_DOMAINS: [
        'itallstartedwithaidea.com',
        // Add more corporate domains here:
        // 'yourcompany.com',
        // 'subsidiary.com',
        // 'partner-company.com',
    ],
    
    
    // =============================================
    // FEATURE FLAGS
    // =============================================
    // These settings control application behavior.
    // Can be modified at runtime via Admin Dashboard.
    
    FEATURES: {
        
        // ─────────────────────────────────────────
        // TEAM SHARING
        // ─────────────────────────────────────────
        // When enabled, corporate users can share assets
        // with other users from the same email domain.
        // 
        // true  = Teams can share within their domain
        // false = All users have isolated workspaces
        
        TEAM_SHARING_ENABLED: true,
        
        
        // ─────────────────────────────────────────
        // PERSONAL USERS
        // ─────────────────────────────────────────
        // Allow users with personal email addresses
        // (Gmail, Yahoo, Hotmail, etc.) to sign in.
        // 
        // true  = Anyone can sign in
        // false = Only corporate/configured domains allowed
        
        PERSONAL_USERS_ENABLED: true,
        
        
        // ─────────────────────────────────────────
        // ACTIVITY LOGGING
        // ─────────────────────────────────────────
        // Track user actions (logins, logouts, changes).
        // Viewable in Admin Dashboard > Activity Log.
        // 
        // true  = Log all user activity
        // false = No activity logging
        
        ACTIVITY_LOG_ENABLED: true,
        
        
        // ─────────────────────────────────────────
        // ACTIVITY LOG RETENTION
        // ─────────────────────────────────────────
        // Number of days to keep activity logs.
        // Older logs are automatically deleted.
        // 
        // Recommended: 30-90 days
        
        ACTIVITY_LOG_RETENTION_DAYS: 90,
        
        
        // ─────────────────────────────────────────
        // APPROVAL WORKFLOW
        // ─────────────────────────────────────────
        // Require admin approval before new users
        // can access the application.
        // 
        // true  = New users must be approved by admin
        // false = New users can sign in immediately
        // 
        // NOTE: Admins are never blocked by approval requirement
        
        REQUIRE_APPROVAL: false,
        
        
        // ─────────────────────────────────────────
        // DEFAULT ROLE
        // ─────────────────────────────────────────
        // Role assigned to new users on first login.
        // Can be overridden per-user in Admin Dashboard.
        // 
        // Options:
        // - 'viewer'  = Read-only access (recommended)
        // - 'editor'  = Can create, edit, delete own content
        // 
        // NOTE: Admin role is only assigned via ADMIN_EMAILS
        
        DEFAULT_ROLE: 'viewer',
    }
};


/**
 * =============================================
 * ROLE PERMISSIONS REFERENCE
 * =============================================
 * 
 * VIEWER (Read Only):
 * - View all content they have access to
 * - Add items to favorites
 * - Download content
 * - Cannot upload, edit, or delete anything
 * 
 * EDITOR (Create & Edit):
 * - All Viewer permissions
 * - Upload new content
 * - Edit any content
 * - Rename files
 * - Delete OWN content only
 * - Access team assets (if TEAM_SHARING enabled)
 * 
 * ADMIN (Full Access):
 * - All Editor permissions
 * - Delete ANY content
 * - Access Admin Dashboard
 * - Manage users (add, remove, block, change roles)
 * - Configure settings
 * - View activity logs
 * - Export/import configuration
 * 
 * =============================================
 * PERSONAL EMAIL DOMAINS (Auto-Detected)
 * =============================================
 * These are automatically treated as personal accounts:
 * - gmail.com, googlemail.com
 * - hotmail.com, outlook.com, live.com, msn.com
 * - yahoo.com, ymail.com
 * - aol.com, protonmail.com, icloud.com, me.com
 * - mail.com, zoho.com, gmx.com
 * 
 * Any domain NOT in this list and NOT in CORPORATE_DOMAINS
 * is treated as a corporate domain by default.
 * 
 * =============================================
 * CONFIGURATION EXAMPLES
 * =============================================
 * 
 * Example 1: Internal Tool (Corporate Only)
 * -----------------------------------------
 * CORPORATE_DOMAINS: ['yourcompany.com'],
 * FEATURES: {
 *     TEAM_SHARING_ENABLED: true,
 *     PERSONAL_USERS_ENABLED: false,  // Block personal emails
 *     REQUIRE_APPROVAL: false,
 *     DEFAULT_ROLE: 'editor',
 * }
 * 
 * Example 2: Public App (Anyone Can Join)
 * ---------------------------------------
 * CORPORATE_DOMAINS: [],
 * FEATURES: {
 *     TEAM_SHARING_ENABLED: false,  // No team features
 *     PERSONAL_USERS_ENABLED: true,
 *     REQUIRE_APPROVAL: false,
 *     DEFAULT_ROLE: 'viewer',
 * }
 * 
 * Example 3: Controlled Access (Approval Required)
 * ------------------------------------------------
 * CORPORATE_DOMAINS: ['yourcompany.com'],
 * FEATURES: {
 *     TEAM_SHARING_ENABLED: true,
 *     PERSONAL_USERS_ENABLED: true,
 *     REQUIRE_APPROVAL: true,   // Admin must approve new users
 *     DEFAULT_ROLE: 'viewer',
 * }
 */

