# Design Review - Quick Fixes Guide

**Date**: 2025-12-19  
**Priority**: High/Medium fixes for design consistency

---

## 🚀 Quick Fixes (Copy-Paste Ready)

### 1. Fix Logo Size in SideNavigation

**File**: `frontend/src/components/navigation/SideNavigation.tsx`

**Line 48**: Change
```tsx
size={isExpanded ? 140 : 48}
```

**To**:
```tsx
size={isExpanded ? 120 : 48}
```

---

### 2. Add Yellow Color Variable

**File**: `frontend/src/app/globals.css`

**Add after line 32** (after FPL colors section):
```css
  /* Additional Colors */
  --pl-yellow: #ffd700;
```

---

### 3. Replace Hardcoded Yellow Colors

**File**: `frontend/src/components/dashboard/OpponentFormStats.tsx`

**Replace all instances of `yellow-500` with `var(--pl-yellow)`**:

- Line 238: `bg-yellow-500/20` → `bg-[var(--pl-yellow)]/20`
- Line 239: `text-yellow-500` → `text-[var(--pl-yellow)]`
- Line 258: `bg-yellow-500/10 border border-yellow-500/30` → `bg-[var(--pl-yellow)]/10 border border-[var(--pl-yellow)]/30`
- Line 280: `bg-yellow-500 text-black` → `bg-[var(--pl-yellow)] text-black`
- Line 304: `bg-yellow-500/20` → `bg-[var(--pl-yellow)]/20`
- Line 305: `text-yellow-500` → `text-[var(--pl-yellow)]`
- Line 324: `bg-yellow-500` → `bg-[var(--pl-yellow)]`
- Line 341: `bg-yellow-500/10 border border-yellow-500/30` → `bg-[var(--pl-yellow)]/10 border border-[var(--pl-yellow)]/30`
- Line 361: `bg-yellow-500 text-black` → `bg-[var(--pl-yellow)] text-black`

---

### 4. Fix Border Radius in OpponentFormStats

**File**: `frontend/src/components/dashboard/OpponentFormStats.tsx`

**Change `rounded` to `rounded-lg`** for stat boxes:

- Line 234: `rounded` → `rounded-lg`
- Line 238: `rounded` → `rounded-lg`
- Line 242: `rounded` → `rounded-lg`
- Line 253: `rounded` → `rounded-lg`
- Line 275: `rounded` → `rounded-lg`
- Line 300: `rounded` → `rounded-lg`
- Line 304: `rounded` → `rounded-lg`
- Line 308: `rounded` → `rounded-lg`
- Line 319: `rounded` → `rounded-lg`
- Line 336: `rounded` → `rounded-lg`
- Line 356: `rounded` → `rounded-lg`

---

### 5. Fix Responsive Grid in OpponentFormStats

**File**: `frontend/src/components/dashboard/OpponentFormStats.tsx`

**Line 233**: Change
```tsx
<div className="grid grid-cols-3 gap-2 mb-4">
```

**To**:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
```

**Line 299**: Change
```tsx
<div className="grid grid-cols-3 gap-2 mb-4">
```

**To**:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
```

---

### 6. Add Hover State to FavoriteTeamInjuryAlerts

**File**: `frontend/src/components/dashboard/FavoriteTeamInjuryAlerts.tsx`

**Line 46**: Change
```tsx
className="p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10"
```

**To**:
```tsx
className="p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10 hover:bg-[var(--pl-pink)]/20 transition-colors"
```

---

### 7. (Optional) Standardize DashboardSection Padding

**File**: `frontend/src/components/dashboard/DashboardSection.tsx`

**Line 38**: If you want to match other cards, change
```tsx
className={`rounded-2xl border-[4px] ${borderColor} ${bgColor} p-6 sm:p-8 mb-8 sm:mb-10 overflow-hidden`}
```

**To** (to match standard card padding):
```tsx
className={`rounded-2xl border-[4px] ${borderColor} ${bgColor} p-4 sm:p-6 mb-8 sm:mb-10 overflow-hidden`}
```

**Note**: The larger padding (`p-6 sm:p-8`) may be intentional for section containers. If so, keep it but document it as a design decision.

---

## ✅ Verification Checklist

After making these fixes, verify:

- [ ] Logo in sidebar is properly sized (120px when expanded)
- [ ] Yellow colors are now using CSS variable
- [ ] Border radius is consistent (`rounded-lg` for stat boxes)
- [ ] Grids are responsive on mobile (2 columns, 3 on larger screens)
- [ ] Hover states work on injury cards
- [ ] No visual regressions on desktop/mobile

---

## 📝 Notes

- These are **non-breaking changes** - they only affect styling
- All changes maintain existing functionality
- Changes improve consistency and responsiveness
- Test on mobile devices to verify grid changes work well

---

**Ready to implement!** 🚀




