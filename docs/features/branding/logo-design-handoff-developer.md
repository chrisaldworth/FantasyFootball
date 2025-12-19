# Fotmate Logo Design - Developer Handoff

**From**: UI Designer Agent  
**To**: Developer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation (After Logo Design)  
**Priority**: P0 (Critical)

---

## Overview

This document provides implementation guidance for integrating the Fotmate logo across the application. The logo should replace the current placeholder "F" logo and be implemented consistently throughout the site.

**Brand Name**: Fotmate  
**Domain**: fotmate.com

---

## Design Specification Reference

**Complete Design Spec**: `docs/features/branding/logo-design-spec.md`

This document contains:
- Logo design concepts and recommendations
- Color variations and specifications
- Size specifications
- Usage guidelines
- File format requirements

**Please review the design spec thoroughly before implementation.**

---

## Implementation Priority

### Phase 1: Core Logo Implementation (P0 - Critical)
1. **Create Logo Component**: React component for logo display
2. **Update Header**: Replace placeholder logo with Fotmate logo
3. **Update Favicon**: Replace current favicon with Fotmate favicon
4. **Update App Icons**: Replace app icons with Fotmate icons

### Phase 2: Site-Wide Updates (P0 - Critical)
5. **Update All Pages**: Replace logo references across all pages
6. **Update Footer**: Add Fotmate logo to footer
7. **Update Email Templates**: Add logo to email templates (if applicable)
8. **Update Loading Screens**: Add logo to loading screens

### Phase 3: Brand Assets (P1 - High)
9. **Social Media Assets**: Update social media profiles
10. **Documentation**: Update documentation with logo
11. **Marketing Materials**: Update marketing materials (if applicable)

---

## Key Implementation Notes

### 1. Create Logo Component

**File**: `frontend/src/components/Logo.tsx` (new)

**Props**:
```typescript
interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark' | 'stacked';
  color?: 'full' | 'white' | 'black' | 'gradient';
  size?: number;
  className?: string;
  href?: string;
}
```

**Implementation**:
```tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark' | 'stacked';
  color?: 'full' | 'white' | 'black' | 'gradient';
  size?: number;
  className?: string;
  href?: string;
}

export default function Logo({
  variant = 'full',
  color = 'full',
  size = 120,
  className = '',
  href,
}: LogoProps) {
  const getLogoPath = () => {
    const variantPath = variant === 'full' ? 'full' : variant === 'icon' ? 'icon' : variant === 'wordmark' ? 'wordmark' : 'stacked';
    const colorPath = color === 'full' ? 'full-color' : color === 'white' ? 'white' : color === 'black' ? 'black' : 'gradient';
    return `/logo/${variantPath}-${colorPath}.svg`;
  };

  const logoElement = (
    <div className={`flex items-center ${className}`} style={{ width: size }}>
      <Image
        src={getLogoPath()}
        alt="Fotmate"
        width={size}
        height={variant === 'stacked' ? size * 1.2 : size * 0.4}
        className="object-contain"
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}
```

---

### 2. Update Header/Navigation

**File**: `frontend/src/app/page.tsx`, `frontend/src/app/dashboard/page.tsx`, etc.

**Changes**:
1. Replace `TeamLogo` with `Logo` component
2. Update to use Fotmate logo
3. Remove team theme dependency

**Implementation**:
```tsx
import Logo from '@/components/Logo';

// In header/navigation
<Logo
  variant="full"
  color="white"
  size={120}
  href="/"
  className="flex items-center"
/>
```

---

### 3. Update Favicon

**Files to Update**:
- `frontend/public/favicon.ico` - Replace with new ICO file
- `frontend/src/app/favicon.ico` - Replace with new ICO file
- `frontend/public/icon-192.svg` - Replace with new SVG favicon

**Implementation**:
1. Place new favicon files in `frontend/public/`
2. Update `frontend/src/app/layout.tsx` metadata if needed
3. Ensure all sizes are included in ICO file

**File Structure**:
```
frontend/public/
  ├── favicon.ico (multi-size ICO)
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── favicon-48x48.png
  ├── favicon-64x64.png
  ├── favicon-128x128.png
  ├── favicon-256x256.png
  └── icon-192.svg (SVG favicon)
```

---

### 4. Update App Icons

**Files to Update**:
- `frontend/public/icon-192.svg` - Replace with new icon
- iOS app icon (if applicable)
- Android app icon (if applicable)

**Implementation**:
1. Place app icon files in appropriate locations
2. Update `frontend/capacitor.config.ts` if needed
3. Update iOS/Android app configurations

---

### 5. Update All Logo References

**Files to Check**:
- `frontend/src/app/page.tsx` - Home page header/footer
- `frontend/src/app/login/page.tsx` - Login page
- `frontend/src/app/register/page.tsx` - Register page
- `frontend/src/app/dashboard/page.tsx` - Dashboard (if logo shown)
- `frontend/src/components/TeamLogo.tsx` - Replace or update

**Search and Replace**:
```bash
# Find all TeamLogo usage
grep -r "TeamLogo" frontend/src/

# Replace with Logo component
# Update imports and usage
```

---

### 6. Update Footer

**File**: `frontend/src/app/page.tsx` (footer section)

**Implementation**:
```tsx
<footer className="py-12 px-6 border-t border-white/5">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
    <Logo
      variant="full"
      color="white"
      size={100}
      href="/"
    />
    <div className="text-[var(--pl-text-muted)] text-sm">
      © 2024 Fotmate. Not affiliated with the Premier League.
    </div>
  </div>
</footer>
```

---

### 7. Update Metadata

**File**: `frontend/src/app/layout.tsx`

**Implementation**:
```tsx
export const metadata: Metadata = {
  title: "Fotmate | AI-Powered Fantasy Premier League Insights",
  description: "Your intelligent companion for Fantasy Premier League. Get AI-powered transfer suggestions, captaincy picks, and team analysis.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/favicon-256x256.png',
  },
};
```

---

## File Organization

### Logo Files Structure

```
frontend/public/logo/
  ├── full-full-color.svg
  ├── full-white.svg
  ├── full-black.svg
  ├── full-gradient.svg
  ├── icon-full-color.svg
  ├── icon-white.svg
  ├── icon-black.svg
  ├── wordmark-full-color.svg
  ├── wordmark-white.svg
  ├── wordmark-black.svg
  ├── stacked-full-color.svg
  ├── stacked-white.svg
  └── stacked-black.svg

frontend/public/
  ├── favicon.ico
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── favicon-48x48.png
  ├── favicon-64x64.png
  ├── favicon-128x128.png
  ├── favicon-256x256.png
  └── icon-192.svg
```

---

## Component Usage Examples

### Header Logo
```tsx
<Logo
  variant="full"
  color="white"
  size={120}
  href="/"
/>
```

### Mobile Navigation Logo
```tsx
<Logo
  variant="icon"
  color="white"
  size={40}
  href="/"
/>
```

### Footer Logo
```tsx
<Logo
  variant="full"
  color="white"
  size={100}
  href="/"
/>
```

### Loading Screen Logo
```tsx
<Logo
  variant="full"
  color="gradient"
  size={200}
/>
```

### Email Template Logo
```tsx
<Logo
  variant="full"
  color="black"
  size={150}
/>
```

---

## Testing Requirements

### Visual Testing
- [ ] Logo displays correctly in header
- [ ] Logo displays correctly in footer
- [ ] Logo displays correctly on all pages
- [ ] Favicon displays correctly in browser
- [ ] App icons display correctly
- [ ] All color variations work on appropriate backgrounds
- [ ] Logo scales correctly at different sizes

### Functional Testing
- [ ] Logo links to home page (when href provided)
- [ ] Logo component accepts all props correctly
- [ ] Logo works in dark and light themes
- [ ] Logo works on mobile and desktop
- [ ] Favicon updates in browser

### Responsive Testing
- [ ] Logo scales appropriately on mobile
- [ ] Logo scales appropriately on tablet
- [ ] Logo scales appropriately on desktop
- [ ] Icon-only variant works in small spaces

### Accessibility Testing
- [ ] Logo has proper alt text
- [ ] Logo is keyboard accessible (when link)
- [ ] Logo has proper focus states (when link)
- [ ] Logo contrast meets WCAG AA standards

---

## Migration Strategy

### Step 1: Prepare Logo Files
1. Receive logo files from designer
2. Organize files in `frontend/public/logo/`
3. Place favicon files in `frontend/public/`
4. Verify all file formats and sizes

### Step 2: Create Logo Component
1. Create `Logo.tsx` component
2. Test component with all variants
3. Test component with all color options
4. Verify responsive behavior

### Step 3: Update Site-Wide
1. Replace `TeamLogo` with `Logo` component
2. Update all page headers
3. Update footer
4. Update favicon and app icons
5. Update metadata

### Step 4: Test and Verify
1. Test on all pages
2. Test on all devices
3. Verify favicon updates
4. Verify app icons update
5. Check for any missed logo references

---

## Success Criteria

Implementation is complete when:
- ✅ Logo component created and working
- ✅ Logo displays correctly in header
- ✅ Logo displays correctly in footer
- ✅ Favicon updated and working
- ✅ App icons updated (if applicable)
- ✅ All pages use new logo
- ✅ All color variations work correctly
- ✅ Logo scales correctly at all sizes
- ✅ Responsive behavior works correctly
- ✅ Accessibility requirements met

---

## Questions or Issues?

If you encounter any issues or need clarification:

1. **Design Questions**: Refer to `docs/features/branding/logo-design-spec.md`
2. **Requirements Questions**: Ask Product and Project Agent
3. **Technical Questions**: Use your best judgment, document decisions
4. **File Questions**: Ensure all logo files are provided before implementation

---

## Next Steps

1. **Wait for Logo Design**: Logo files must be created by designer first
2. **Review Logo Files**: Verify all files are provided and correct
3. **Create Logo Component**: Build React component for logo display
4. **Update Site**: Replace all logo references
5. **Test**: Test thoroughly on all pages and devices
6. **Deploy**: Deploy updated site with new logo

---

**Note**: This implementation guide assumes logo files have been created by a designer. The actual logo design files (SVG, PNG, ICO) need to be provided before implementation can begin.

---

**Good luck with implementation! 🚀**

**Remember**: Maintain consistency across all logo usage, ensure proper sizing and color variations, and test thoroughly on all devices!

---

**Handoff Complete!**

