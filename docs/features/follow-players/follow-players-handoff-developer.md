# Follow Players - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P1 (Follow Players - Player Tracking)

---

## Overview

Complete implementation guide for the Follow Players feature. This document provides step-by-step instructions, code examples, and implementation details for all 4 components.

**Reference Documents**:
- Design Specification: `follow-players-design-spec.md` ⭐ **START HERE**
- Requirements: `follow-players-requirements.md`
- Handoff: `follow-players-handoff-ui-designer.md`

---

## Design Specification

**Full Design Spec**: `docs/features/follow-players/follow-players-design-spec.md`

**Key Design Decisions**:
- Star icon (⭐) for follow indicator (filled = following, outline = not following)
- Top-right corner placement for follow button
- Grid layout for followed players list (responsive: 1/2/3-4 columns)
- Compact cards with key stats (photo, name, team, price, form, points)
- Horizontal scroll widget for dashboard
- Dropdown menus for sort/filter
- Color-coded form indicators (green/yellow/red)
- Always-visible follow indicator

---

## Implementation Tasks

### Task 1: Create FollowButton Component

**File**: `frontend/src/components/follow-players/FollowButton.tsx`

**Props**:
```typescript
interface FollowButtonProps {
  playerId: number;
  playerName?: string;
  isFollowed: boolean;
  onToggle: (playerId: number, willFollow: boolean) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button';
  className?: string;
}
```

**Implementation**:
```tsx
'use client';

import { useState } from 'react';

export default function FollowButton({
  playerId,
  playerName,
  isFollowed,
  onToggle,
  size = 'medium',
  variant = 'icon',
  className = '',
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);

  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      await onToggle(playerId, !isFollowed);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Error handling (toast notification, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizes[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        hover:scale-110
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2
        ${isFollowed 
          ? 'text-[var(--pl-green)] hover:text-[var(--pl-green)]/80' 
          : 'text-[#999999] hover:text-[var(--pl-green)]'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isFollowed ? `Unfollow ${playerName || 'player'}` : `Follow ${playerName || 'player'}`}
      title={isFollowed ? `Unfollow ${playerName || 'player'}` : `Follow ${playerName || 'player'}`}
    >
      {loading ? (
        <svg
          className={`animate-spin ${sizes[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill={isFollowed ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </button>
  );
}
```

---

### Task 2: Create FollowedPlayerCard Component

**File**: `frontend/src/components/follow-players/FollowedPlayerCard.tsx`

**Props**:
```typescript
interface FollowedPlayerCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    positionId: number;
    price: number;
    form: number;
    totalPoints: number;
    priceChange: number;
    ownership: number;
    nextFixture?: {
      opponent: string;
      difficulty: number;
      isHome: boolean;
    };
  };
  onViewDetails: () => void;
  onUnfollow: () => void;
}
```

**Implementation**: See design spec for layout structure. Use glass morphism styling, team colors, form indicators.

---

### Task 3: Create FollowedPlayersList Component

**File**: `frontend/src/app/fantasy-football/followed-players/page.tsx`

**Implementation**: 
- Fetch followed players from API
- Grid layout (responsive)
- Search, sort, filter functionality
- Empty state handling
- Loading states

---

### Task 4: Create FollowedPlayersWidget Component

**File**: `frontend/src/components/follow-players/FollowedPlayersWidget.tsx`

**Implementation**:
- Horizontal scroll container
- Compact player cards
- "View All" link
- Empty state

---

## API Integration

### Required Backend Endpoints

1. **Follow Player**: `POST /api/fpl/follow-player`
   - Body: `{ "player_id": number }`
   - Response: `{ "success": bool, "message": string }`

2. **Unfollow Player**: `DELETE /api/fpl/unfollow-player/{player_id}`
   - Response: `{ "success": bool, "message": string }`

3. **Get Followed Players**: `GET /api/fpl/followed-players`
   - Response: `Array<{ player_id: number, created_at: string }>`

4. **Get Followed Players with Stats**: `GET /api/fpl/followed-players/stats`
   - Response: Array of players with FPL stats

5. **Check Follow Status**: `GET /api/fpl/player/{player_id}/follow-status`
   - Response: `{ "is_followed": bool, "followed_at": string | null }`

### Frontend API Methods

Add to `frontend/src/lib/api.ts`:

```typescript
export const fplApi = {
  // ... existing methods ...
  
  followPlayer: async (playerId: number) => {
    const response = await api.post('/api/fpl/follow-player', { player_id: playerId });
    return response.data;
  },

  unfollowPlayer: async (playerId: number) => {
    const response = await api.delete(`/api/fpl/unfollow-player/${playerId}`);
    return response.data;
  },

  getFollowedPlayers: async () => {
    const response = await api.get('/api/fpl/followed-players');
    return response.data;
  },

  getFollowedPlayersWithStats: async () => {
    const response = await api.get('/api/fpl/followed-players/stats');
    return response.data;
  },

  checkFollowStatus: async (playerId: number) => {
    const response = await api.get(`/api/fpl/player/${playerId}/follow-status`);
    return response.data;
  },
};
```

---

## Integration Points

### Add FollowButton to Existing Components

1. **Player Detail Modal** (`PlayerModal` or similar):
   ```tsx
   import FollowButton from '@/components/follow-players/FollowButton';
   
   // In component:
   <div className="relative">
     <FollowButton
       playerId={player.id}
       playerName={player.web_name}
       isFollowed={isFollowed}
       onToggle={handleToggleFollow}
       size="medium"
       className="absolute top-2 right-2 z-10"
     />
     {/* ... rest of modal content ... */}
   </div>
   ```

2. **Player Search Results**: Add FollowButton to each result card

3. **Transfer Assistant**: Add FollowButton to recommendation cards

4. **Team View**: Add FollowButton to opponent team player cards

---

## State Management

### Follow Status Caching

Consider using React Context or a custom hook to cache follow status:

```tsx
// frontend/src/hooks/useFollowedPlayers.ts
export function useFollowedPlayers() {
  const [followedPlayers, setFollowedPlayers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load followed players on mount
  useEffect(() => {
    loadFollowedPlayers();
  }, []);

  const loadFollowedPlayers = async () => {
    try {
      const data = await fplApi.getFollowedPlayers();
      setFollowedPlayers(new Set(data.map((p: any) => p.player_id)));
    } catch (error) {
      console.error('Failed to load followed players:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (playerId: number, willFollow: boolean) => {
    // Optimistic update
    setFollowedPlayers(prev => {
      const newSet = new Set(prev);
      if (willFollow) {
        newSet.add(playerId);
      } else {
        newSet.delete(playerId);
      }
      return newSet;
    });

    try {
      if (willFollow) {
        await fplApi.followPlayer(playerId);
      } else {
        await fplApi.unfollowPlayer(playerId);
      }
    } catch (error) {
      // Revert on error
      setFollowedPlayers(prev => {
        const newSet = new Set(prev);
        if (willFollow) {
          newSet.delete(playerId);
        } else {
          newSet.add(playerId);
        }
        return newSet;
      });
      throw error;
    }
  };

  return {
    followedPlayers,
    isFollowed: (playerId: number) => followedPlayers.has(playerId),
    toggleFollow,
    loading,
  };
}
```

---

## Testing Checklist

### Functionality
- [ ] Follow button toggles correctly
- [ ] Follow status persists across page reloads
- [ ] Maximum follow limit enforced (20 players)
- [ ] Error handling works (network errors, limit reached)
- [ ] Optimistic updates work correctly
- [ ] Followed players list displays correctly
- [ ] Sorting works (recently followed, name, points, price, form)
- [ ] Filtering works (position, team, price range)
- [ ] Search works
- [ ] Empty state displays correctly
- [ ] Dashboard widget displays correctly

### Integration
- [ ] FollowButton appears in player detail view
- [ ] FollowButton appears in search results
- [ ] FollowButton appears in transfer assistant
- [ ] FollowButton appears in team views
- [ ] Followed players highlighted in lists

### Responsive
- [ ] Mobile (320px) - Single column, stacked filters
- [ ] Tablet (768px) - 2 columns, inline filters
- [ ] Desktop (1024px+) - 3-4 columns, full layout

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation works
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators visible

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀


