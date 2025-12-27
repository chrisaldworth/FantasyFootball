# Admin Portal - Requirements Document
**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P0  
**Feature**: Admin Portal for Fotmate Platform Management

---

## 🎯 Overview

The Admin Portal is a comprehensive administrative interface that allows authorized administrators to manage all aspects of the Fotmate platform, including users, content, data, system configuration, analytics, and support operations.

---

## 🎯 Objectives

### Primary Goals
1. **Centralized Management**: Single interface for all administrative tasks
2. **User Management**: Full CRUD operations on users, roles, and permissions
3. **Content Moderation**: Manage and moderate user-generated content (leagues, picks, etc.)
4. **System Configuration**: Control feature flags, API settings, and system behavior
5. **Analytics & Monitoring**: Real-time insights into platform usage, health, and engagement
6. **Support Tools**: Assist users, handle support requests, and resolve issues
7. **Data Management**: Manage football data, fixtures, teams, and external API integrations
8. **Audit & Compliance**: Track all admin actions, user activity, and system changes

---

## 🔐 Authentication & Authorization

### User Roles
The system must support role-based access control (RBAC) with the following roles:

1. **Super Admin** (Full Access)
   - All permissions
   - System configuration
   - User role management
   - Cannot be deleted or demoted

2. **Admin** (High Access)
   - User management (except role changes)
   - Content moderation
   - Analytics access
   - System monitoring

3. **Moderator** (Limited Access)
   - Content moderation
   - User flagging/reporting
   - Limited analytics
   - No user management

4. **Support** (Support Access)
   - View user details
   - View user activity
   - Create support tickets
   - No content moderation or system changes

### Access Control
- **Authentication**: Same JWT-based auth as main app
- **Role Verification**: Middleware to check admin roles on all endpoints
- **Permission Checks**: Fine-grained permissions for each action
- **Session Management**: Admin sessions with timeout and activity logging

---

## 📋 Feature Requirements

### 1. User Management

#### 1.1 User List & Search
- **List View**: Paginated table of all users
- **Search**: By username, email, FPL team ID, favorite team
- **Filters**: 
  - Active/Inactive
  - Premium/Free
  - Registration date range
  - Last activity date
  - Role (if applicable)
- **Sorting**: By registration date, last activity, username, email
- **Bulk Actions**: Export CSV, bulk activate/deactivate

#### 1.2 User Detail View
- **Profile Information**:
  - Username, email
  - Registration date, last activity
  - FPL team ID, favorite team
  - Premium status
  - Account status (active/inactive)
- **Activity Summary**:
  - Total weekly picks submitted
  - League memberships
  - Last login
  - Notification preferences
- **Actions**:
  - Edit user details
  - Change password (admin reset)
  - Activate/deactivate account
  - Grant/revoke premium
  - View activity log
  - Impersonate user (for support - audit logged)

#### 1.3 User Creation/Editing
- **Create User**: Manual user creation with email, username, password
- **Edit User**: Update email, username, premium status, favorite team
- **Password Reset**: Admin-initiated password reset
- **Account Status**: Activate/deactivate accounts

#### 1.4 User Roles & Permissions
- **Role Assignment**: Assign roles to users (admin, moderator, support)
- **Permission Management**: Fine-grained permissions per role
- **Audit Log**: All role changes logged with admin who made change

---

### 2. Weekly Picks Management

#### 2.1 Picks Overview
- **List View**: All weekly picks submissions
- **Filters**: 
  - Gameweek
  - User
  - Date range
  - Points range
  - Status (valid, invalid, flagged)
- **Sorting**: By points, date, gameweek, user

#### 2.2 Pick Detail View
- **Submission Details**:
  - User information
  - Gameweek
  - Score predictions (3 fixtures)
  - Player picks (3 players)
  - Points breakdown
  - Submission timestamp
- **Actions**:
  - View full breakdown
  - Flag for review
  - Manual point adjustment (with reason)
  - Delete submission (with audit log)

#### 2.3 Pick Moderation
- **Flagged Picks**: Queue of picks flagged for review
- **Validation**: Verify picks meet requirements
- **Manual Corrections**: Fix calculation errors
- **Bulk Actions**: Approve/reject multiple picks

---

### 3. League Management

#### 3.1 League List
- **List View**: All private leagues
- **Filters**:
  - League name
  - Creator
  - Type (weekly, seasonal, both)
  - Member count
  - Creation date
- **Sorting**: By member count, creation date, name

#### 3.2 League Detail View
- **League Information**:
  - Name, description
  - Type, invite code
  - Creator
  - Creation date
  - Member count
- **Members List**: All league members with join dates
- **Actions**:
  - Edit league details
  - Remove members
  - Delete league
  - View league leaderboard

---

### 4. Analytics & Monitoring

#### 4.1 User Analytics
- **Overview Metrics**:
  - Total users (active, inactive, premium)
  - New registrations (daily, weekly, monthly)
  - User growth trends
  - Premium conversion rate
  - User retention (DAU, WAU, MAU)
- **Visualizations**: Charts for trends over time
- **Export**: CSV/JSON export of data

#### 4.2 Engagement Analytics
- **Weekly Picks**:
  - Total submissions per gameweek
  - Average points per gameweek
  - Participation rate
  - Most popular fixtures picked
  - Most picked players
- **Leagues**:
  - Total leagues created
  - Average league size
  - League activity
- **Visualizations**: Charts, graphs, heatmaps

#### 4.3 System Health
- **API Status**: 
  - FPL API status
  - External API status (API-FOOTBALL, Football-Data.org)
  - Response times
  - Error rates
- **Database Metrics**:
  - Connection pool status
  - Query performance
  - Table sizes
- **Server Metrics** (if available):
  - CPU, memory usage
  - Request rates
  - Error rates

#### 4.4 Activity Logs
- **User Activity**: Login attempts, actions, errors
- **Admin Activity**: All admin actions with timestamps and user
- **System Events**: API failures, data sync issues, errors
- **Filtering**: By date, user, action type, severity

---

### 5. System Configuration

#### 5.1 Feature Flags
- **Enable/Disable Features**:
  - Weekly Picks feature
  - Private Leagues feature
  - Premium features
  - Maintenance mode
- **Rollout Controls**: Percentage rollout for new features
- **Environment-Specific**: Different flags for dev/staging/prod

#### 5.2 API Configuration
- **External APIs**:
  - FPL API status and settings
  - API-FOOTBALL key management
  - Football-Data.org key management
  - Rate limiting settings
- **Data Sync**: Manual trigger for data sync jobs
- **Cache Management**: Clear cache, view cache stats

#### 5.3 System Settings
- **General Settings**:
  - Site name, description
  - Maintenance mode message
  - Support email
  - Announcement banners
- **Email Settings**: SMTP configuration, email templates
- **Notification Settings**: Default notification preferences

---

### 6. Content Management

#### 6.1 News Management (If Applicable)
- **News Feed Management**: 
  - Add/edit/delete news articles
  - Feature/unfeature articles
  - Manage news sources (RSS feeds)
- **Team News**: Manage team-specific news

#### 6.2 Announcements
- **Site Announcements**:
  - Create/edit/delete announcements
  - Set visibility (all users, premium only, etc.)
  - Schedule announcements
  - Expiry dates

---

### 7. Support Tools

#### 7.1 User Support
- **User Lookup**: Quick search to find user by username/email
- **User Activity View**: See user's recent activity, picks, leagues
- **Impersonation**: Temporarily log in as user (with audit trail)
- **Support Tickets**: Create and manage support tickets (if implemented)

#### 7.2 Issue Resolution
- **Manual Corrections**: Fix user data, picks, points
- **Refund/Adjustments**: Grant premium access, adjust points
- **Account Recovery**: Assist with account recovery

---

### 8. Data Management

#### 8.1 Football Data (If Stored Locally)
- **Teams**: View/edit team information
- **Fixtures**: View/manage fixtures
- **Matches**: View match data
- **Players**: View player data (if cached locally)

#### 8.2 Data Sync
- **Manual Sync**: Trigger manual data sync from external APIs
- **Sync Status**: View sync job status and history
- **Error Handling**: View and resolve sync errors

---

### 9. Security & Audit

#### 9.1 Audit Log
- **Admin Actions**: All admin actions logged with:
  - Admin user
  - Timestamp
  - Action type
  - Target (user, content, etc.)
  - Before/after values (for edits)
  - IP address
- **Search & Filter**: By admin, action type, date, target
- **Export**: CSV export of audit logs

#### 9.2 Security Monitoring
- **Failed Login Attempts**: Track and flag suspicious activity
- **API Abuse**: Monitor for API abuse or unusual patterns
- **User Flagging**: Flag users for suspicious behavior

---

## 🎨 UI/UX Requirements

### Design Principles
- **Clean & Professional**: Business-focused design, not consumer-facing
- **Efficient**: Quick access to common tasks
- **Responsive**: Works on desktop and tablet (primary focus on desktop)
- **Accessible**: WCAG AA compliance
- **Consistent**: Matches Fotmate branding but distinct from main app

### Navigation
- **Top Navigation**: 
  - Logo/Home link
  - Main sections (Users, Picks, Leagues, Analytics, Settings, etc.)
  - Admin user dropdown (profile, logout)
- **Sidebar** (Optional): Quick links, recent activity
- **Breadcrumbs**: Clear navigation hierarchy

### Layout
- **Dashboard Home**: Overview with key metrics and recent activity
- **List Views**: Tables with pagination, sorting, filtering
- **Detail Views**: Full information with actions
- **Forms**: Clear labels, validation, error messages

### Key Pages/Sections
1. **Dashboard** (Home)
2. **Users** (List, Detail, Create/Edit)
3. **Weekly Picks** (List, Detail, Moderation)
4. **Leagues** (List, Detail)
5. **Analytics** (Overview, User Analytics, Engagement, System Health)
6. **System Configuration** (Feature Flags, API Settings, System Settings)
7. **Content Management** (News, Announcements)
8. **Support Tools** (User Support, Issue Resolution)
9. **Audit Log** (Admin Actions, Security Monitoring)

---

## 🔒 Security Requirements

### Authentication
- **JWT Tokens**: Same authentication system as main app
- **Admin Session**: Separate admin session management
- **Session Timeout**: 30 minutes of inactivity
- **2FA Support**: Optional two-factor authentication for admins

### Authorization
- **Role-Based Access**: All endpoints check user role
- **Permission Checks**: Fine-grained permissions
- **Route Protection**: All admin routes protected
- **API Protection**: All admin API endpoints require admin role

### Data Protection
- **Sensitive Data**: Mask passwords, encrypted FPL passwords
- **Audit Trail**: All admin actions logged
- **No Direct DB Access**: All changes through API
- **Input Validation**: All inputs validated and sanitized

---

## 📊 Technical Requirements

### Backend
- **New API Endpoints**: `/api/admin/*` endpoints for all admin operations
- **Role Management**: Add `role` field to User model
- **Permission System**: Permission middleware and checks
- **Audit Logging**: Audit log model and service
- **Admin Service**: Business logic for admin operations

### Frontend
- **New Route**: `/admin/*` routes (protected)
- **Admin Components**: Reusable components for admin UI
- **Data Tables**: Sortable, filterable, paginated tables
- **Charts**: Chart library for analytics visualizations
- **Forms**: Form components for create/edit operations

### Database
- **New Models**:
  - `AdminAction` (audit log)
  - `FeatureFlag` (system configuration)
  - `Announcement` (site announcements)
- **User Model Updates**: Add `role` field

---

## 📈 Success Metrics

### Adoption
- Admin portal accessed daily by admin team
- Average time to complete common tasks

### Efficiency
- Time to resolve user issues
- Time to moderate content
- Time to configure system settings

### Accuracy
- Zero data corruption incidents
- Zero unauthorized access incidents
- 100% of admin actions audited

---

## 🚀 Implementation Phases

### Phase 1: MVP (Core Admin Features)
- User management (CRUD, search, filters)
- Basic analytics (user counts, engagement metrics)
- Admin authentication and role system
- Audit logging
- System health monitoring

### Phase 2: Content & Moderation
- Weekly picks management and moderation
- League management
- Content moderation tools
- Support tools (user lookup, activity view)

### Phase 3: Advanced Features
- Advanced analytics (charts, trends, exports)
- Feature flags and system configuration
- Content management (announcements, news)
- Data management tools

### Phase 4: Enhancement
- Advanced security (2FA, IP whitelisting)
- Automation tools
- Custom reports
- Integration with external tools

---

## ✅ Acceptance Criteria

### User Management
- ✅ Admin can view, search, and filter users
- ✅ Admin can view user details and activity
- ✅ Admin can edit user information
- ✅ Admin can activate/deactivate users
- ✅ Admin can grant/revoke premium
- ✅ All actions are audited

### Weekly Picks Management
- ✅ Admin can view all picks submissions
- ✅ Admin can view pick details and breakdown
- ✅ Admin can flag and moderate picks
- ✅ Admin can manually adjust points (with reason)

### Analytics
- ✅ Admin can view user analytics (counts, growth, retention)
- ✅ Admin can view engagement analytics (picks, leagues)
- ✅ Admin can view system health metrics
- ✅ Analytics data is exportable

### System Configuration
- ✅ Admin can enable/disable feature flags
- ✅ Admin can manage API configurations
- ✅ Admin can update system settings
- ✅ Changes take effect immediately

### Security
- ✅ Only authorized admins can access portal
- ✅ All admin actions are logged
- ✅ Sensitive data is protected
- ✅ Session timeout works correctly

---

## 📝 Notes

- **Role System**: Must be backward compatible with existing users (default to no role)
- **Audit Log**: Critical for compliance and security
- **Performance**: Admin portal should not impact main app performance
- **Mobile**: Desktop-first, tablet support, mobile not required
- **Documentation**: Admin user guide required for onboarding

---

## 🎯 Next Steps

1. Create UI Designer handoff document
2. Design admin portal UI/UX
3. Implement role-based access control
4. Build admin API endpoints
5. Build admin frontend interface
6. Test and iterate

---

**Document Status**: ✅ Requirements Complete  
**Next**: Create UI Designer handoff document

