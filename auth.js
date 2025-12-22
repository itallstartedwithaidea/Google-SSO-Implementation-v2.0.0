/**
 * Google SSO Authentication Module
 * ================================
 * Enterprise-grade Single Sign-On implementation
 * 
 * Version: 2.0.0
 * Author: John Williams (itallstartedwithaidea)
 * License: MIT
 * 
 * Features:
 * - Google OAuth 2.0 authentication
 * - Role-based access control (RBAC)
 * - Corporate domain detection
 * - Session management
 * - Activity logging
 * - User management
 * 
 * Usage:
 *   1. Include this script after auth-config.js
 *   2. Call GoogleSSO.init() on page load
 *   3. Access user session via GoogleSSO.getSession()
 */

(function(global) {
    'use strict';

    // =============================================
    // STORAGE KEYS
    // =============================================
    const STORAGE_KEYS = {
        SESSION: 'gss_user_session',
        ACTIVITY: 'gss_user_activity',
        USERS: 'gss_managed_users',
        SETTINGS: 'gss_admin_settings'
    };

    // =============================================
    // PERSONAL EMAIL DOMAINS
    // =============================================
    const PERSONAL_DOMAINS = [
        'gmail.com', 'googlemail.com',
        'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
        'yahoo.com', 'ymail.com', 'yahoo.co.uk', 'yahoo.fr',
        'aol.com', 'protonmail.com', 'proton.me',
        'icloud.com', 'me.com', 'mac.com',
        'mail.com', 'zoho.com', 'gmx.com', 'gmx.net',
        'yandex.com', 'yandex.ru',
        'qq.com', '163.com', '126.com',
        'fastmail.com', 'tutanota.com', 'posteo.de',
        'hey.com', 'pm.me'
    ];

    // =============================================
    // DEFAULT SETTINGS
    // =============================================
    const DEFAULT_SETTINGS = {
        teamSharingEnabled: true,
        personalUsersEnabled: true,
        activityLogEnabled: true,
        activityLogRetentionDays: 90,
        requireApproval: false,
        defaultRole: 'viewer',
        corporateDomains: [],
        adminEmails: [],
        blockedEmails: [],
        blockedDomains: []
    };

    // =============================================
    // EVENT NAMES
    // =============================================
    const EVENTS = {
        LOGIN: 'gss:login',
        LOGOUT: 'gss:logout',
        SESSION_UPDATE: 'gss:session_update',
        ROLE_CHANGE: 'gss:role_change',
        SETTINGS_CHANGE: 'gss:settings_change',
        ERROR: 'gss:error'
    };

    // =============================================
    // CONFIGURATION GETTER
    // =============================================
    function getConfig() {
        const settings = getSettings();
        const authConfig = global.AUTH_CONFIG || {};
        
        return {
            GOOGLE_CLIENT_ID: authConfig.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            ADMIN_EMAILS: settings.adminEmails.length > 0 
                ? settings.adminEmails 
                : (authConfig.ADMIN_EMAILS || []),
            CORPORATE_DOMAINS: settings.corporateDomains.length > 0 
                ? settings.corporateDomains 
                : (authConfig.CORPORATE_DOMAINS || []),
            FEATURES: {
                TEAM_SHARING_ENABLED: settings.teamSharingEnabled,
                PERSONAL_USERS_ENABLED: settings.personalUsersEnabled,
                ACTIVITY_LOG_ENABLED: settings.activityLogEnabled,
                ACTIVITY_LOG_RETENTION_DAYS: settings.activityLogRetentionDays,
                REQUIRE_APPROVAL: settings.requireApproval,
                DEFAULT_ROLE: settings.defaultRole
            }
        };
    }

    // =============================================
    // SETTINGS MANAGEMENT
    // =============================================
    function getSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
            const authConfig = global.AUTH_CONFIG || {};
            
            // Merge saved settings with defaults and initial config
            return { 
                ...DEFAULT_SETTINGS,
                corporateDomains: authConfig.CORPORATE_DOMAINS || [],
                adminEmails: authConfig.ADMIN_EMAILS || [],
                ...saved 
            };
        } catch (e) {
            console.warn('[GSS] Failed to load settings:', e);
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            dispatchEvent(EVENTS.SETTINGS_CHANGE, settings);
            return true;
        } catch (e) {
            console.error('[GSS] Failed to save settings:', e);
            return false;
        }
    }

    function updateSettings(updates) {
        const current = getSettings();
        const updated = { ...current, ...updates };
        return saveSettings(updated);
    }

    // =============================================
    // USER MANAGEMENT
    // =============================================
    function getManagedUsers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
        } catch (e) {
            console.warn('[GSS] Failed to load managed users:', e);
            return {};
        }
    }

    function saveManagedUsers(users) {
        try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return true;
        } catch (e) {
            console.error('[GSS] Failed to save managed users:', e);
            return false;
        }
    }

    function getManagedUser(email) {
        const users = getManagedUsers();
        return users[email.toLowerCase()] || null;
    }

    function setManagedUser(email, userData) {
        const users = getManagedUsers();
        users[email.toLowerCase()] = {
            ...userData,
            email: email.toLowerCase(),
            updatedAt: new Date().toISOString()
        };
        saveManagedUsers(users);
        return users[email.toLowerCase()];
    }

    function removeManagedUser(email) {
        const users = getManagedUsers();
        delete users[email.toLowerCase()];
        saveManagedUsers(users);
    }

    // =============================================
    // SESSION MANAGEMENT
    // =============================================
    function getSession() {
        try {
            const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
            
            // Validate session structure
            if (session && session.email && session.loginTime) {
                return session;
            }
            return null;
        } catch (e) {
            console.warn('[GSS] Failed to load session:', e);
            return null;
        }
    }

    function setSession(userData) {
        const session = {
            ...userData,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
            logActivity('login', userData);
            dispatchEvent(EVENTS.LOGIN, session);
            return session;
        } catch (e) {
            console.error('[GSS] Failed to save session:', e);
            dispatchEvent(EVENTS.ERROR, { type: 'session_save', error: e });
            return null;
        }
    }

    function updateSession(updates) {
        const session = getSession();
        if (!session) return null;
        
        const updated = {
            ...session,
            ...updates,
            lastActivity: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
            dispatchEvent(EVENTS.SESSION_UPDATE, updated);
            return updated;
        } catch (e) {
            console.error('[GSS] Failed to update session:', e);
            return null;
        }
    }

    function clearSession() {
        const session = getSession();
        if (session) {
            logActivity('logout', session);
        }
        
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        dispatchEvent(EVENTS.LOGOUT, session);
    }

    function updateActivity() {
        const session = getSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        }
    }

    // =============================================
    // ACTIVITY LOGGING
    // =============================================
    function logActivity(action, userData, details = {}) {
        const settings = getSettings();
        if (!settings.activityLogEnabled) return;
        
        try {
            const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
            
            activities.push({
                id: generateId(),
                action,
                email: userData?.email || 'unknown',
                name: userData?.name || 'Unknown',
                userType: userData?.userType || 'unknown',
                role: userData?.role || 'unknown',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                details
            });
            
            // Cleanup old activities based on retention days
            const retentionMs = settings.activityLogRetentionDays * 24 * 60 * 60 * 1000;
            const cutoffDate = new Date(Date.now() - retentionMs).toISOString();
            const filtered = activities.filter(a => a.timestamp > cutoffDate);
            
            // Also limit total count
            const limited = filtered.slice(-1000);
            
            localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(limited));
        } catch (e) {
            console.warn('[GSS] Failed to log activity:', e);
        }
    }

    function getActivityLog(options = {}) {
        try {
            const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
            
            let filtered = [...activities];
            
            // Filter by email
            if (options.email) {
                filtered = filtered.filter(a => a.email === options.email.toLowerCase());
            }
            
            // Filter by action
            if (options.action) {
                filtered = filtered.filter(a => a.action === options.action);
            }
            
            // Filter by date range
            if (options.startDate) {
                filtered = filtered.filter(a => a.timestamp >= options.startDate);
            }
            if (options.endDate) {
                filtered = filtered.filter(a => a.timestamp <= options.endDate);
            }
            
            // Sort
            if (options.sortDesc !== false) {
                filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
            
            // Limit
            if (options.limit) {
                filtered = filtered.slice(0, options.limit);
            }
            
            return filtered;
        } catch (e) {
            console.warn('[GSS] Failed to get activity log:', e);
            return [];
        }
    }

    function clearActivityLog() {
        localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    }

    function exportActivityLog(format = 'csv') {
        const activities = getActivityLog();
        
        if (format === 'csv') {
            const headers = 'Timestamp,Action,Name,Email,UserType,Role,Details';
            const rows = activities.map(a => 
                `"${a.timestamp}","${a.action}","${a.name}","${a.email}","${a.userType}","${a.role}","${JSON.stringify(a.details || {})}"`
            );
            return headers + '\n' + rows.join('\n');
        }
        
        if (format === 'json') {
            return JSON.stringify(activities, null, 2);
        }
        
        return activities;
    }

    // =============================================
    // USER TYPE & ROLE DETECTION
    // =============================================
    function getEmailDomain(email) {
        return email?.split('@')[1]?.toLowerCase() || '';
    }

    function isAdminEmail(email) {
        const config = getConfig();
        return config.ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
    }

    function isCorporateDomain(domain) {
        const config = getConfig();
        return config.CORPORATE_DOMAINS.map(d => d.toLowerCase()).includes(domain.toLowerCase());
    }

    function isPersonalDomain(domain) {
        return PERSONAL_DOMAINS.includes(domain.toLowerCase());
    }

    function isBlocked(email) {
        const settings = getSettings();
        const domain = getEmailDomain(email);
        
        return (settings.blockedEmails || []).includes(email.toLowerCase()) ||
               (settings.blockedDomains || []).includes(domain.toLowerCase());
    }

    function getUserType(email) {
        const domain = getEmailDomain(email);
        
        if (isAdminEmail(email)) {
            return 'admin';
        }
        if (isCorporateDomain(domain)) {
            return 'corporate';
        }
        if (isPersonalDomain(domain)) {
            return 'personal';
        }
        // Unknown domain - treat as corporate
        return 'corporate';
    }

    function getUserRole(email) {
        // Check managed user role first
        const managedUser = getManagedUser(email);
        if (managedUser && managedUser.role) {
            return managedUser.role;
        }
        
        // Admin emails always get admin role
        if (isAdminEmail(email)) {
            return 'admin';
        }
        
        // Default role from settings
        const config = getConfig();
        return config.FEATURES.DEFAULT_ROLE || 'viewer';
    }

    function setUserRole(email, role) {
        const session = getSession();
        const managedUser = getManagedUser(email) || { email: email };
        
        setManagedUser(email, { ...managedUser, role: role });
        
        if (session) {
            logActivity('role_changed', session, { 
                targetEmail: email, 
                newRole: role 
            });
        }
        
        dispatchEvent(EVENTS.ROLE_CHANGE, { email, role });
    }

    // =============================================
    // PERMISSION CHECKS
    // =============================================
    function canAccessTeam(userType, role) {
        const settings = getSettings();
        if (!settings.teamSharingEnabled) return false;
        return ['admin', 'corporate'].includes(userType) || 
               ['admin', 'editor'].includes(role);
    }

    function canUpload(role) {
        return role === 'admin' || role === 'editor';
    }

    function canEdit(role) {
        return role === 'admin' || role === 'editor';
    }

    function canDelete(role, ownerId = null, currentUserId = null) {
        if (role === 'admin') return true;
        if (role === 'editor' && ownerId && currentUserId && ownerId === currentUserId) {
            return true;
        }
        return false;
    }

    function canManageUsers(role) {
        return role === 'admin';
    }

    function hasPermission(permission) {
        const session = getSession();
        if (!session) return false;
        
        const { role, userType } = session;
        
        switch (permission) {
            case 'view':
                return true;
            case 'upload':
                return canUpload(role);
            case 'edit':
                return canEdit(role);
            case 'delete':
                return role === 'admin';
            case 'delete_own':
                return canEdit(role);
            case 'team_access':
                return canAccessTeam(userType, role);
            case 'manage_users':
                return canManageUsers(role);
            case 'admin':
                return role === 'admin';
            default:
                return false;
        }
    }

    // =============================================
    // JWT HANDLING
    // =============================================
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
            console.error('[GSS] Failed to decode JWT:', e);
            return null;
        }
    }

    // =============================================
    // GOOGLE SIGN-IN
    // =============================================
    let isInitialized = false;

    function initGoogleSignIn(options = {}) {
        const config = getConfig();
        
        if (config.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
            console.warn('[GSS] Google Client ID not configured. Using demo mode.');
            setupDemoMode();
            return false;
        }

        // Check if Google Identity Services is loaded
        if (typeof google === 'undefined' || !google.accounts) {
            console.warn('[GSS] Google Identity Services not loaded. Retrying in 500ms...');
            setTimeout(() => initGoogleSignIn(options), 500);
            return false;
        }

        try {
            google.accounts.id.initialize({
                client_id: config.GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
                auto_select: options.autoSelect !== false,
                cancel_on_tap_outside: options.cancelOnTapOutside !== false
            });

            // Render button if container exists
            const container = options.buttonContainer || document.getElementById('google-signin-container');
            if (container) {
                google.accounts.id.renderButton(container, {
                    theme: options.theme || 'outline',
                    size: options.size || 'large',
                    text: options.text || 'signin_with',
                    shape: options.shape || 'rectangular',
                    logo_alignment: options.logoAlignment || 'left',
                    width: options.width
                });
            }

            // Prompt One Tap if enabled
            if (options.showOneTap !== false) {
                google.accounts.id.prompt();
            }

            isInitialized = true;
            console.log('[GSS] Google Sign-In initialized successfully');
            return true;
        } catch (e) {
            console.error('[GSS] Failed to initialize Google Sign-In:', e);
            dispatchEvent(EVENTS.ERROR, { type: 'initialization', error: e });
            return false;
        }
    }

    function handleGoogleResponse(response) {
        console.log('[GSS] Received Google response');
        
        const payload = decodeJWT(response.credential);
        
        if (payload) {
            processLogin(payload.email, payload.name, payload.picture, payload.sub);
        } else {
            dispatchEvent(EVENTS.ERROR, { type: 'jwt_decode', error: 'Failed to decode token' });
        }
    }

    function processLogin(email, name, picture, googleId) {
        console.log('[GSS] Processing login for:', email);
        
        // Check if blocked
        if (isBlocked(email)) {
            console.warn('[GSS] User is blocked:', email);
            dispatchEvent(EVENTS.ERROR, { 
                type: 'blocked', 
                error: 'Access denied. Your account has been blocked.',
                email 
            });
            return null;
        }

        const settings = getSettings();
        const userType = getUserType(email);
        
        // Check if personal users are allowed
        if (userType === 'personal' && !settings.personalUsersEnabled) {
            console.warn('[GSS] Personal accounts not allowed');
            dispatchEvent(EVENTS.ERROR, { 
                type: 'personal_disabled', 
                error: 'Personal accounts are not allowed. Please use a corporate email.',
                email 
            });
            return null;
        }

        // Check if approval required
        if (settings.requireApproval) {
            const managedUser = getManagedUser(email);
            if (!managedUser || managedUser.status !== 'approved') {
                if (!isAdminEmail(email)) {
                    console.warn('[GSS] User requires approval:', email);
                    dispatchEvent(EVENTS.ERROR, { 
                        type: 'approval_required', 
                        error: 'Your account requires admin approval.',
                        email 
                    });
                    return null;
                }
            }
        }

        const role = getUserRole(email);
        
        // Create session
        const session = setSession({
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            picture: picture || generateAvatar(name || email),
            userType: userType,
            role: role,
            canAccessTeam: canAccessTeam(userType, role),
            googleId: googleId || 'demo-' + Date.now()
        });

        // Update managed user record
        setManagedUser(email, {
            name: session.name,
            picture: session.picture,
            userType: userType,
            role: role,
            lastLogin: new Date().toISOString(),
            loginCount: (getManagedUser(email)?.loginCount || 0) + 1
        });

        console.log('[GSS] Login successful:', session.email, '(' + session.role + ')');
        return session;
    }

    function signOut(options = {}) {
        const config = getConfig();
        
        // Disable Google auto-select
        if (config.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
            typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        clearSession();
        
        // Optionally reload page
        if (options.reload !== false) {
            setTimeout(() => location.reload(), 100);
        }
    }

    // =============================================
    // DEMO MODE
    // =============================================
    function setupDemoMode() {
        console.log('[GSS] Demo mode enabled');
        
        // Check for URL parameter auto-login
        const urlParams = new URLSearchParams(window.location.search);
        const demoEmail = urlParams.get('demo');
        
        if (demoEmail && demoEmail.includes('@')) {
            const name = demoEmail.split('@')[0]
                .replace(/[._]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            setTimeout(() => processLogin(demoEmail, name, null, null), 100);
            return;
        }
        
        // Setup demo button click handler
        const signinBtn = document.getElementById('google-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', () => {
                const email = prompt('Enter your email address (demo mode):');
                if (email && email.includes('@')) {
                    const name = email.split('@')[0]
                        .replace(/[._]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    processLogin(email, name, null, null);
                }
            });
        }
    }

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function generateAvatar(name) {
        const encodedName = encodeURIComponent(name || 'User');
        return `https://ui-avatars.com/api/?name=${encodedName}&background=a855f7&color=fff&size=128`;
    }

    function dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    function exportConfig() {
        return {
            settings: getSettings(),
            users: getManagedUsers(),
            exportedAt: new Date().toISOString()
        };
    }

    function importConfig(data) {
        try {
            if (data.settings) {
                saveSettings({ ...getSettings(), ...data.settings });
            }
            if (data.users) {
                const currentUsers = getManagedUsers();
                saveManagedUsers({ ...currentUsers, ...data.users });
            }
            return true;
        } catch (e) {
            console.error('[GSS] Failed to import config:', e);
            return false;
        }
    }

    // =============================================
    // INITIALIZATION
    // =============================================
    function init(options = {}) {
        console.log('[GSS] Initializing Google SSO module');
        
        // Check for existing session and validate
        const session = getSession();
        if (session) {
            // Revalidate permissions
            const role = getUserRole(session.email);
            const userType = getUserType(session.email);
            
            if (session.role !== role || session.userType !== userType) {
                updateSession({
                    role: role,
                    userType: userType,
                    canAccessTeam: canAccessTeam(userType, role)
                });
            }
            
            console.log('[GSS] Existing session found:', session.email);
        }
        
        // Initialize Google Sign-In if not already logged in
        if (!session || options.forceInit) {
            if (typeof google !== 'undefined' && google.accounts) {
                initGoogleSignIn(options);
            } else {
                // Wait for Google Identity Services to load
                window.addEventListener('load', () => {
                    setTimeout(() => initGoogleSignIn(options), 500);
                });
            }
        }
        
        // Setup activity tracking
        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        
        return session;
    }

    // =============================================
    // PUBLIC API
    // =============================================
    const GoogleSSO = {
        // Initialization
        init,
        initGoogleSignIn,
        
        // Session Management
        getSession,
        setSession,
        updateSession,
        clearSession,
        signOut,
        processLogin,
        
        // User Management
        getManagedUser,
        setManagedUser,
        removeManagedUser,
        getManagedUsers,
        
        // User Type & Role
        getUserType,
        getUserRole,
        setUserRole,
        isAdminEmail,
        isCorporateDomain,
        isPersonalDomain,
        isBlocked,
        getEmailDomain,
        
        // Permissions
        hasPermission,
        canUpload,
        canEdit,
        canDelete,
        canManageUsers,
        canAccessTeam,
        
        // Settings
        getSettings,
        saveSettings,
        updateSettings,
        getConfig,
        
        // Activity
        logActivity,
        getActivityLog,
        clearActivityLog,
        exportActivityLog,
        
        // Import/Export
        exportConfig,
        importConfig,
        
        // Utilities
        decodeJWT,
        generateId,
        generateAvatar,
        
        // Constants
        EVENTS,
        STORAGE_KEYS,
        PERSONAL_DOMAINS,
        
        // State
        get isInitialized() { return isInitialized; },
        get isLoggedIn() { return !!getSession(); }
    };

    // Expose to global scope
    global.GoogleSSO = GoogleSSO;

    // Auto-initialize if config exists
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (global.AUTH_CONFIG) {
                    init();
                }
            });
        } else {
            if (global.AUTH_CONFIG) {
                init();
            }
        }
    }

})(typeof window !== 'undefined' ? window : global);

