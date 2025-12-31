# Admin Portal - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P0 (Admin Portal - Platform Management)

---

## Overview

Complete implementation guide for the Fotmate Admin Portal. This document provides step-by-step instructions, code examples, and implementation details for all 9 sections and 12+ components.

**Reference Documents**:
- Design Specification: `admin-portal-design-spec.md` ⭐ **START HERE**
- Requirements: `admin-portal-requirements.md`
- Handoff: `admin-portal-handoff-ui-designer.md`

---

## Design Specification

**Full Design Spec**: `docs/features/admin-portal/admin-portal-design-spec.md`

**Key Design Decisions**:
- Top nav + Sidebar navigation
- Grid dashboard layout with metric cards
- Full-width data tables with expandable rows
- Separate pages for forms (modals for quick actions)
- Recharts for analytics visualizations
- Darker, more muted color scheme (distinct from main app)
- Dropdown menus for multi-actions, icon buttons for single actions
- Collapsible filter panels
- Separate pages for details, side panels for quick views
- Colored badges for status indicators

---

## Implementation Tasks

### Phase 1: Foundation (MVP)

#### Task 1: Admin Authentication & Authorization

**Backend**:
1. Add `role` field to User model
2. Create admin authentication middleware
3. Create role-based permission system
4. Add admin session management (30min timeout)

**Frontend**:
1. Create `/admin` route group
2. Create admin authentication guard component
3. Create role-based route protection
4. Create admin layout component

**File**: `frontend/src/app/admin/layout.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminTopNavigation from '@/components/admin/AdminTopNavigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['admin', 'super_admin'].includes(user.role || ''))) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !['admin', 'super_admin'].includes(user.role || '')) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminTopNavigation />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

#### Task 2: Create Base Components (12+ Components)

##### Component 1: DataTable

**File**: `frontend/src/components/admin/DataTable.tsx`

**Props**:
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => ReactNode;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: keyof T;
    direction: 'asc' | 'desc';
    onSort: (column: keyof T, direction: 'asc' | 'desc') => void;
  };
  actions?: (row: T) => ReactNode;
}
```

**Implementation**: See design spec for layout. Use Tailwind CSS for styling.

---

##### Component 2: UserCard

**File**: `frontend/src/components/admin/UserCard.tsx`

**Implementation**: See design spec for layout.

---

##### Component 3: MetricCard

**File**: `frontend/src/components/admin/MetricCard.tsx`

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

**Implementation**:
```tsx
'use client';

export default function MetricCard({
  label,
  value,
  trend,
  trendValue,
  icon,
}: MetricCardProps) {
  return (
    <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#999999]">{label}</span>
        {icon && <div className="text-[var(--pl-green)]">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      {trend && trendValue && (
        <div className={`text-sm flex items-center gap-1 ${
          trend === 'up' ? 'text-[#10b981]' : 
          trend === 'down' ? 'text-[#ef4444]' : 
          'text-[#999999]'
        }`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  );
}
```

---

##### Component 4: ChartComponent

**File**: `frontend/src/components/admin/ChartComponent.tsx`

**Installation**: 
```bash
npm install recharts
```

**Implementation**: Use Recharts library. See design spec for types and props.

---

##### Component 5-12: Remaining Components

See design spec for full component specifications:
- FormInput
- FilterBar
- ActionMenu
- AuditLogEntry
- StatusBadge
- Modal/Dialog
- Breadcrumbs
- SidebarNavigation

---

#### Task 3: Create Screen Components

##### Screen 1: Dashboard

**File**: `frontend/src/app/admin/page.tsx`

**Implementation**: See design spec for layout. Fetch metrics from API.

---

##### Screen 2: Users Management

**File**: `frontend/src/app/admin/users/page.tsx` (List)  
**File**: `frontend/src/app/admin/users/[id]/page.tsx` (Detail)  
**File**: `frontend/src/app/admin/users/create/page.tsx` (Create)  
**File**: `frontend/src/app/admin/users/[id]/edit/page.tsx` (Edit)

**Implementation**: See design spec for layouts.

---

##### Screen 3: Weekly Picks Management

**File**: `frontend/src/app/admin/weekly-picks/page.tsx` (List)  
**File**: `frontend/src/app/admin/weekly-picks/[id]/page.tsx` (Detail)

**Implementation**: See design spec for layouts.

---

##### Screen 4: League Management

**File**: `frontend/src/app/admin/leagues/page.tsx` (List)  
**File**: `frontend/src/app/admin/leagues/[id]/page.tsx` (Detail)

**Implementation**: See design spec for layouts.

---

##### Screen 5: Analytics

**File**: `frontend/src/app/admin/analytics/page.tsx`

**Implementation**: See design spec for dashboard layout with charts.

---

##### Screen 6: System Configuration

**File**: `frontend/src/app/admin/config/page.tsx`  
**File**: `frontend/src/app/admin/config/feature-flags/page.tsx`  
**File**: `frontend/src/app/admin/config/api/page.tsx`

**Implementation**: See design spec for layouts.

---

##### Screen 7: Content Management

**File**: `frontend/src/app/admin/content/page.tsx`  
**File**: `frontend/src/app/admin/content/announcements/page.tsx`

**Implementation**: See design spec for layouts.

---

##### Screen 8: Support Tools

**File**: `frontend/src/app/admin/support/page.tsx`

**Implementation**: See design spec for user lookup and activity view.

---

##### Screen 9: Audit Log

**File**: `frontend/src/app/admin/audit/page.tsx`

**Implementation**: See design spec for audit log table.

---

## API Integration

### Required Backend Endpoints

#### User Management
- `GET /api/admin/users` - List users (with pagination, filters)
- `GET /api/admin/users/{id}` - Get user details
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/{id}/reset-password` - Reset password
- `PUT /api/admin/users/{id}/status` - Activate/deactivate

#### Weekly Picks Management
- `GET /api/admin/weekly-picks` - List picks (with filters)
- `GET /api/admin/weekly-picks/{id}` - Get pick details
- `PUT /api/admin/weekly-picks/{id}/points` - Adjust points
- `DELETE /api/admin/weekly-picks/{id}` - Delete pick
- `PUT /api/admin/weekly-picks/{id}/flag` - Flag/unflag pick

#### League Management
- `GET /api/admin/leagues` - List leagues
- `GET /api/admin/leagues/{id}` - Get league details
- `PUT /api/admin/leagues/{id}` - Update league
- `DELETE /api/admin/leagues/{id}` - Delete league

#### Analytics
- `GET /api/admin/analytics/overview` - Overview metrics
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/engagement` - Engagement analytics
- `GET /api/admin/analytics/system-health` - System health

#### System Configuration
- `GET /api/admin/config/feature-flags` - Get feature flags
- `PUT /api/admin/config/feature-flags` - Update feature flags
- `GET /api/admin/config/api` - Get API settings
- `PUT /api/admin/config/api` - Update API settings

#### Audit Log
- `GET /api/admin/audit` - Get audit log (with filters, pagination)
- `POST /api/admin/audit/export` - Export audit log

---

## Styling & Theme

### Color Variables

Add to your global CSS or Tailwind config:

```css
:root {
  --admin-bg: #0a0a0a;
  --admin-card: #1a1a1a;
  --admin-border: #2a2a2a;
  --admin-text-primary: #ffffff;
  --admin-text-secondary: #999999;
  --admin-success: #10b981;
  --admin-error: #ef4444;
  --admin-warning: #f59e0b;
}
```

### Glass Morphism Effect

```css
.glass {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Testing Checklist

### Authentication & Authorization
- [ ] Admin routes require authentication
- [ ] Only admin/super_admin roles can access
- [ ] Session timeout works (30 minutes)
- [ ] Role-based permissions enforced

### User Management
- [ ] User list loads with pagination
- [ ] Search and filters work
- [ ] User detail view displays correctly
- [ ] Create user form works
- [ ] Edit user form works
- [ ] Activate/deactivate works
- [ ] Password reset works

### Weekly Picks Management
- [ ] Picks list loads with filters
- [ ] Pick detail view displays correctly
- [ ] Point adjustment works
- [ ] Flag/unflag works
- [ ] Delete pick works

### Analytics
- [ ] Overview metrics load correctly
- [ ] Charts render correctly
- [ ] Date range filters work
- [ ] Export functionality works

### System Configuration
- [ ] Feature flags toggle correctly
- [ ] API settings update correctly
- [ ] Changes take effect immediately

### Audit Log
- [ ] All admin actions logged
- [ ] Audit log displays correctly
- [ ] Filters work
- [ ] Export works

### Responsive
- [ ] Desktop (1920px+) - Full layout works
- [ ] Desktop (1440px) - Layout adapts
- [ ] Tablet (768px) - Sidebar collapses, tables scroll
- [ ] Mobile (<768px) - Hamburger menu, stack layouts

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] Focus indicators visible

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Admin authentication & authorization
- [ ] Dashboard with basic metrics
- [ ] User management (list, detail, edit)
- [ ] Basic data table component
- [ ] Admin navigation (top nav + sidebar)

### Phase 2: Content Management (Week 3)
- [ ] Weekly picks management
- [ ] League management
- [ ] Audit log
- [ ] Filter components

### Phase 3: Advanced Features (Week 4)
- [ ] Analytics dashboard with charts
- [ ] System configuration
- [ ] Content management (announcements)
- [ ] Support tools

### Phase 4: Polish (Week 5)
- [ ] Responsive optimizations
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Error handling
- [ ] Loading states

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀


