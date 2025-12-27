# Admin Portal - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P0 (Admin Portal - Platform Management)  
**For**: Developer Agent

---

## Overview

Complete design specifications for the Fotmate Admin Portal. This document provides detailed layouts, component specs, responsive breakpoints, and implementation guidance for all 9 sections and 12+ components.

**Reference Documents**:
- Requirements: `admin-portal-requirements.md`
- Handoff: `admin-portal-handoff-ui-designer.md`
- Current Implementation: Basic admin API exists (schema fixes only)

---

## Design Answers

### 1. Navigation
**Answer**: **Top nav + Sidebar** - Top nav for main sections, sidebar for quick links and context-specific actions

### 2. Dashboard Layout
**Answer**: **Grid of metric cards with sections below** - Overview metrics at top, detailed sections below

### 3. Data Tables
**Answer**: **Full-width with essential columns, expandable rows for details** - Desktop shows more, mobile shows essentials

### 4. Forms
**Answer**: **Separate pages for create/edit, modals for quick actions** - Better for complex forms, modals for simple actions

### 5. Analytics Charts
**Answer**: **Recharts library** - React-native, responsive, good mobile support

### 6. Color Coding
**Answer**: **Darker, more muted color scheme** - Darker background (#0a0a0a), grays for tables, brand colors for accents/CTAs

### 7. Actions
**Answer**: **Dropdown menus for multi-actions, icon buttons for single actions** - Efficient, clean, space-saving

### 8. Filters
**Answer**: **Collapsible panel on desktop, bottom sheet on mobile** - Hidden by default, accessible when needed

### 9. Detail Views
**Answer**: **Separate pages for full details, side panels for quick views** - Full pages for comprehensive info, panels for quick checks

### 10. Status Indicators
**Answer**: **Colored badges** - Green (active/success), Red (inactive/error), Yellow (warning), Gray (neutral)

---

## Screen 1: Dashboard (Home)

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ TopNavigation                                           │
│ [Logo] [Dashboard|Users|Picks|Leagues|Analytics|...]   │
│                                 [Admin User ▼]          │
├─────────────────────────────────────────────────────────┤
│ Sidebar        │ Main Content                           │
│                │                                        │
│ Quick Links    │ OVERVIEW METRICS                       │
│ • Users        │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ • Picks        │ │ 1,234│ │ 45   │ │ 890  │ │ 98%  │ │
│ • Leagues      │ │ Total│ │ New  │ │ Active│ │ Uptime│ │
│ • Analytics    │ │ Users│ │ Today│ │ Users │ │       │ │
│                │ └──────┘ └──────┘ └──────┘ └──────┘ │
│                │                                        │
│ Recent         │ RECENT ACTIVITY                        │
│ Activity       │ ┌────────────────────────────────────┐ │
│ • User signup  │ │ [Time] User created                │ │
│ • Pick flagged │ │ [Time] Pick submitted              │ │
│ • League added │ │ [Time] League created              │ │
│                │ └────────────────────────────────────┘ │
│                │                                        │
│ System         │ SYSTEM HEALTH                          │
│ Alerts         │ ┌────────────────────────────────────┐ │
│ • API Status   │ │ FPL API: ✓ Online                  │ │
│ • DB Status    │ │ DB: ✓ Healthy                      │ │
│                │ └────────────────────────────────────┘ │
│                │                                        │
│                │ QUICK ACTIONS                          │
│                │ [Create User] [View Analytics] ...     │
│                │                                        │
└─────────────────────────────────────────────────────────┘
```

### Design
- Top Navigation: Main sections, admin user dropdown
- Sidebar: Quick links, recent activity, system alerts
- Main Content: Metric cards grid (2x2 or 4 columns), recent activity feed, system health status
- Color Scheme: Dark background (#0a0a0a), muted cards, brand colors for metrics

---

## Screen 2: Users Management

### 2.1 User List

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ TopNavigation                                           │
├─────────────────────────────────────────────────────────┤
│ Sidebar        │ Users Management                       │
│                │                                        │
│                │ [Search Users...] [Filters ▼] [Export]│
│                │                                        │
│                │ USERS TABLE                            │
│                │ ┌────────────────────────────────────┐ │
│                │ │ Username│Email│Status│Role│Actions │ │
│                │ ├────────────────────────────────────┤ │
│                │ │ user1   │...  │Active│User│[⋮]    │ │
│                │ │ user2   │...  │Inact │Admin│[⋮]   │ │
│                │ │ ...                                 │ │
│                │ └────────────────────────────────────┘ │
│                │                                        │
│                │ [← Prev] [1] [2] [3] [Next →]         │
│                │                                        │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Search bar: Full-width, autocomplete
- Filters: Collapsible panel (status, role, date range, premium)
- Table: Sortable columns, pagination, action dropdown
- Actions: Edit, Activate/Deactivate, View Details, Delete

---

### 2.2 User Detail View

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ [← Back to Users] User: username                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ PROFILE INFORMATION                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Username: username                                   │ │
│ │ Email: email@example.com                            │ │
│ │ Status: [Active Badge]                              │ │
│ │ Role: User                                           │ │
│ │ Premium: [Premium Badge]                             │ │
│ │ FPL Team ID: 12345                                   │ │
│ │ Favorite Team: Arsenal                               │ │
│ │ Registered: 2024-01-15                               │ │
│ │ Last Activity: 2024-12-20                            │ │
│ │                                                       │ │
│ │ [Edit User] [Reset Password] [Activate/Deactivate] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ACTIVITY SUMMARY                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Weekly Picks: 45 submissions                        │ │
│ │ Leagues: 5 memberships                              │ │
│ │ Last Login: 2024-12-20 14:30                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ RECENT PICKS                                            │
│ [Table of recent weekly picks]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Profile Card: Key information, editable fields
- Activity Summary: Key metrics
- Recent Activity: Tables/lists of user actions
- Action Buttons: Primary actions prominently displayed

---

### 2.3 Create/Edit User Form

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Create New User                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Username *                                          │ │
│ │ [Input field]                                       │ │
│ │                                                      │ │
│ │ Email *                                             │ │
│ │ [Input field]                                       │ │
│ │                                                      │ │
│ │ Password *                                          │ │
│ │ [Input field]                                       │ │
│ │                                                      │ │
│ │ Status                                              │ │
│ │ ○ Active  ○ Inactive                               │ │
│ │                                                      │ │
│ │ Role                                                │ │
│ │ [Dropdown: User, Admin, Moderator, Support]        │ │
│ │                                                      │ │
│ │ Premium                                             │ │
│ │ ☑ Grant Premium Access                             │ │
│ │                                                      │ │
│ │ Favorite Team                                       │ │
│ │ [Dropdown: All Teams]                               │ │
│ │                                                      │ │
│ │ [Cancel] [Create User]                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Form Layout: Single column, clear labels
- Validation: Real-time validation, error messages
- Required Fields: Marked with asterisk
- Submit: Primary CTA button

---

## Screen 3: Weekly Picks Management

### 3.1 Picks List

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Weekly Picks Management                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Search Picks...] [Gameweek: All ▼] [Status: All ▼]    │
│ [Filters ▼]                                             │
│                                                         │
│ PICKS TABLE                                             │
│ ┌────────────────────────────────────────────────────┐ │
│ │ User│Gameweek│Points│Status│Submitted│Actions     │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ user1│GW 5   │42   │Valid │2024-12-20│[⋮]        │ │
│ │ user2│GW 5   │35   │Flagged│2024-12-20│[⋮]       │ │
│ │ ...                                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ [← Prev] [1] [2] [3] [Next →]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Filters: Gameweek, Status, User, Date Range
- Table: Sortable, expandable rows for details
- Status Badges: Valid (green), Flagged (yellow), Invalid (red)
- Actions: View Details, Flag, Adjust Points, Delete

---

### 3.2 Pick Detail View

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Pick Details                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ USER & SUBMISSION INFO                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ User: username (ID: 123)                            │ │
│ │ Gameweek: 5                                         │ │
│ │ Submitted: 2024-12-20 14:30                        │ │
│ │ Status: [Valid Badge]                               │ │
│ │ Total Points: 42                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ SCORE PREDICTIONS                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Arsenal 2-1 Liverpool                               │ │
│ │ Predicted: 2-1 | Actual: 2-1 | Points: 12          │ │
│ │ [Expand for breakdown]                              │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Repeat for 3 predictions]                              │
│                                                         │
│ PLAYER PICKS                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Player Name (Team)                                  │ │
│ │ FPL Points: 8                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Repeat for 3 players]                                  │
│                                                         │
│ POINTS BREAKDOWN                                        │
│ Score Predictions: 18 pts                               │
│ Player Picks: 15 FPL pts                                │
│ Combo Multiplier: ×1.25                                 │
│ Total: 42 points                                        │
│                                                         │
│ ACTIONS                                                 │
│ [Flag for Review] [Adjust Points] [Delete Pick]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Comprehensive breakdown: All picks displayed clearly
- Expandable sections: Details on demand
- Actions: Contextual actions based on status
- Point adjustment: Modal for manual adjustments

---

## Screen 4: League Management

### 4.1 League List

**Layout**: Similar to Users List
- Table with: League Name, Creator, Type, Members, Created, Actions
- Filters: Type, Member count, Creator, Date range

---

### 4.2 League Detail View

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ [← Back] League: League Name                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ LEAGUE INFORMATION                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Name: League Name                                   │ │
│ │ Type: Weekly + Seasonal                             │ │
│ │ Invite Code: ABC123                                 │ │
│ │ Creator: username                                   │ │
│ │ Members: 12                                         │ │
│ │ Created: 2024-01-15                                 │ │
│ │                                                      │ │
│ │ [Edit League] [Delete League]                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ MEMBERS (12)                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Username│Joined│Rank│Points│Actions                 │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ user1  │2024-01-15│#1│450  │[Remove]               │ │
│ │ user2  │2024-01-16│#2│420  │[Remove]               │ │
│ │ ...                                                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ LEADERBOARD                                             │
│ [Leaderboard component]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen 5: Analytics & Monitoring

### 5.1 Analytics Dashboard

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Analytics & Monitoring                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ OVERVIEW METRICS                                        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ 1,234│ │ 45%  │ │ 890  │ │ 78%  │                  │
│ │ Users│ │ Ret. │ │ Active│ │ Engage│                  │
│ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                         │
│ USER GROWTH                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Line Chart: Users over time]                       │ │
│ │ [Date Range Selector] [Export]                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ENGAGEMENT METRICS                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Bar Chart: Picks per gameweek]                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ SYSTEM HEALTH                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ FPL API: ✓ Online (200ms avg)                      │ │
│ │ Database: ✓ Healthy                                │ │
│ │ Cache Hit Rate: 85%                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Metric Cards: Large numbers, trend indicators
- Charts: Interactive, exportable
- Date Range Selectors: Filter time periods
- Export Buttons: CSV/JSON export

---

## Screen 6: System Configuration

### 6.1 Feature Flags

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ System Configuration > Feature Flags                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ FEATURE FLAGS                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Weekly Picks                  [Toggle: ON]          │ │
│ │ Enable weekly picks feature                         │ │
│ │                                                      │ │
│ │ Private Leagues              [Toggle: ON]           │ │
│ │ Enable private leagues feature                      │ │
│ │                                                      │ │
│ │ Premium Features             [Toggle: OFF]          │ │
│ │ Enable premium features                             │ │
│ │                                                      │ │
│ │ Maintenance Mode             [Toggle: OFF]          │ │
│ │ Put site in maintenance mode                        │ │
│ │                                                      │ │
│ │ [Save Changes]                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Toggle Switches: Clear ON/OFF states
- Descriptions: Brief explanation of each flag
- Save Button: Save all changes at once
- Confirmation: Modal for critical flags (maintenance mode)

---

### 6.2 API Configuration

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ System Configuration > API Settings                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ EXTERNAL APIs                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ FPL API                                             │ │
│ │ Status: ✓ Online                                    │ │
│ │ Response Time: 200ms avg                            │ │
│ │ Last Check: 2024-12-20 15:00                       │ │
│ │                                                      │ │
│ │ API-FOOTBALL                                        │ │
│ │ Status: ✓ Online                                    │ │
│ │ API Key: [Show/Hide] ••••••••                      │ │
│ │ Rate Limit: 100/min                                 │ │
│ │ [Update Key]                                        │ │
│ │                                                      │ │
│ │ [Test Connection] [Sync Data]                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen 7: Content Management

### 7.1 Announcements

**Layout**: List + Create/Edit forms
- Announcement List: Table with title, visibility, start/end dates, actions
- Create Form: Title, content, visibility, dates, schedule

---

## Screen 8: Support Tools

### 8.1 User Support

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Support Tools                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ USER LOOKUP                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Search by username or email...]                    │ │
│ │ [Search]                                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ USER ACTIVITY VIEW                                      │
│ [User detail view with activity logs]                   │
│                                                         │
│ QUICK ACTIONS                                           │
│ [Reset Password] [Impersonate User] [View Activity]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Screen 9: Audit Log

### 9.1 Audit Log View

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│ Audit Log                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Search...] [Admin: All ▼] [Action: All ▼] [Date Range]│
│                                                         │
│ AUDIT LOG TABLE                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Timestamp│Admin│Action│Target│Details│IP          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ 2024-12-20│admin1│Edit User│user123│Changed...│  │ │
│ │ 2024-12-20│admin2│Delete Pick│pick456│...      │  │ │
│ │ ...                                                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ [← Prev] [1] [2] [3] [Next →] [Export CSV]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design**:
- Filters: Admin, Action Type, Date Range, Target
- Table: Comprehensive audit trail
- Export: CSV export functionality
- Details: Expandable rows for full details

---

## Component Specifications

### Component 1: DataTable

**Props**:
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  actions?: (row: T) => ReactNode;
}
```

**Design**:
- Sortable headers: Click to sort
- Filters: Column-level filters
- Pagination: Bottom of table
- Actions: Dropdown menu per row
- Responsive: Horizontal scroll on mobile, essential columns only

---

### Component 2: UserCard

**Props**:
```typescript
interface UserCardProps {
  user: {
    id: number;
    username: string;
    email: string;
    status: 'active' | 'inactive';
    role?: string;
    isPremium: boolean;
  };
  onClick?: () => void;
}
```

**Design**:
- Card: Glass morphism, hover effect
- Key Info: Username, email, status badge
- Actions: Quick actions on hover

---

### Component 3: MetricCard

**Props**:
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
}
```

**Design**:
- Value: Large, prominent number
- Label: Smaller, muted text
- Trend: Arrow indicator with color
- Icon: Optional icon for visual interest

---

### Component 4: ChartComponent

**Props**:
```typescript
interface ChartComponentProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
}
```

**Design**:
- Library: Recharts
- Responsive: Adapts to container size
- Interactive: Tooltips, hover states
- Export: Optional export button

---

### Component 5: FormInput

**Props**:
```typescript
interface FormInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}
```

**Design**:
- Label: Clear, above input
- Input: Standard text input styling
- Error: Red text below input
- Required: Asterisk on label

---

### Component 6: FilterBar

**Props**:
```typescript
interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  collapsible?: boolean;
}
```

**Design**:
- Collapsible: Hidden by default, expandable
- Filters: Search, dropdowns, date pickers
- Clear: "Clear Filters" button
- Applied: Show count of applied filters

---

### Component 7: ActionMenu

**Props**:
```typescript
interface ActionMenuProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    danger?: boolean;
  }>;
}
```

**Design**:
- Trigger: Three-dot icon button
- Dropdown: Positioned below trigger
- Danger Actions: Red text for destructive actions
- Icons: Optional icons for clarity

---

### Component 8: AuditLogEntry

**Props**:
```typescript
interface AuditLogEntryProps {
  entry: {
    timestamp: Date;
    admin: string;
    action: string;
    target: string;
    details?: string;
    ipAddress?: string;
  };
}
```

**Design**:
- Table Row: Or card format
- Timestamp: Formatted date/time
- Action: Colored badge by type
- Details: Expandable for full details

---

### Component 9: StatusBadge

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  label: string;
}
```

**Design**:
- Colors: Green (active/success), Red (inactive/error), Yellow (pending/warning), Gray (neutral)
- Shape: Rounded pill
- Size: Small, inline

---

### Component 10: Modal/Dialog

**Props**:
```typescript
interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Design**:
- Overlay: Dark backdrop
- Content: Centered, rounded, glass effect
- Header: Title with close button
- Footer: Action buttons
- Size: Responsive, max-width constraints

---

### Component 11: Breadcrumbs

**Props**:
```typescript
interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}
```

**Design**:
- Separator: "/" or chevron
- Links: Clickable, except last item
- Style: Muted text, hover underline

---

### Component 12: SidebarNavigation

**Props**:
```typescript
interface SidebarNavigationProps {
  items: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    badge?: number;
  }>;
  currentPath: string;
}
```

**Design**:
- Fixed: Left sidebar, sticky
- Active: Highlighted current page
- Icons: Optional icons for visual clarity
- Badge: Optional notification badge
- Collapsible: Can collapse on tablet

---

## Responsive Design

### Desktop (1920px+)
- Full sidebar visible
- Multi-column layouts
- Full-width tables
- Hover states enabled
- Detailed information visible

### Desktop (1440px - 1919px)
- Full sidebar visible
- 2-3 column layouts
- Full-width tables
- All features available

### Tablet (768px - 1023px)
- Collapsible sidebar
- Single column layouts
- Simplified tables (horizontal scroll)
- Touch-optimized targets

### Mobile (< 768px)
- Hidden sidebar (hamburger menu)
- Stack layouts
- Bottom sheets for actions
- Simplified navigation

---

## Color & Typography

### Color Scheme
- Background: `#0a0a0a` (very dark)
- Cards: `#1a1a1a` (dark gray)
- Borders: `#2a2a2a` (medium gray)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#999999` (muted gray)
- Primary: `var(--pl-green)` (Fotmate green)
- Secondary: `var(--pl-cyan)` (cyan)
- Accent: `var(--pl-pink)` (warnings/alerts)
- Success: `#10b981` (green)
- Error: `#ef4444` (red)
- Warning: `#f59e0b` (yellow)

### Typography
- Headings: Bold, larger sizes
- Body: Regular, readable
- Tables: Monospace for numbers
- Labels: Small, muted

---

## Interaction States

### Buttons
- Default: Base color, rounded
- Hover: Lighter shade, scale 1.02
- Active: Darker shade, scale 0.98
- Disabled: Opacity 0.5, no interaction
- Loading: Spinner, disabled state

### Tables
- Row Hover: Subtle background change
- Selected Row: Border highlight
- Sortable Header: Arrow indicator
- Sorting Active: Highlighted header

### Forms
- Input Focus: Border highlight, glow
- Input Error: Red border, error message
- Input Success: Green border (optional)

---

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀

