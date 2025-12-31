# Follow Players Feature - Requirements Document
**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P1  
**Feature**: Follow Players in Fantasy Football

---

## 🎯 Overview

Allow users to follow specific FPL players to track their performance, receive personalized updates, and access quick insights about players they're interested in for their fantasy team.

---

## 🎯 Objectives

### Primary Goals
1. **Player Tracking**: Enable users to follow/unfollow players they're monitoring
2. **Performance Insights**: Provide quick access to followed players' stats, fixtures, and performance
3. **Personalization**: Surface followed players' information in relevant sections
4. **Notifications**: Option to receive notifications about followed players (goals, assists, injuries, etc.)
5. **Transfer Planning**: Help users track players they're considering for transfers

### Business Value
- **Increased Engagement**: Users check app more frequently to track their followed players
- **Better Decision Making**: Easy access to tracked players helps with transfer and captain decisions
- **User Retention**: Personalized content keeps users coming back
- **Premium Feature Potential**: Could be enhanced feature for premium users

---

## 👤 User Stories

### As a Fantasy Football Manager

1. **Follow a Player**
   - As a user, I want to follow a player so I can track their performance over time
   - I should be able to follow players from player lists, search, team view, or player detail pages
   - Following should be quick (one click/button)

2. **View Followed Players**
   - As a user, I want to see all players I'm following in one place
   - I should see key stats, recent performance, and upcoming fixtures
   - I should be able to quickly access full player details

3. **Unfollow a Player**
   - As a user, I want to unfollow players I'm no longer interested in
   - Unfollowing should be easy and quick

4. **Track Performance**
   - As a user, I want to see followed players' recent performance and stats
   - I should see FPL points, goals, assists, price changes, ownership, etc.
   - I should see upcoming fixtures and difficulty

5. **Receive Updates (Future Enhancement)**
   - As a user, I want to receive notifications about followed players (optional)
   - Notifications for goals, assists, injuries, price changes, etc.

6. **Use in Transfer Planning**
   - As a user, I want to see followed players when making transfers
   - Followed players should be highlighted or easily accessible in transfer views

---

## 📋 Functional Requirements

### 1. Follow/Unfollow Players

#### 1.1 Follow a Player
- **Trigger Points**: User can follow a player from:
  - Player list/search results
  - Player detail/modal view
  - Team view (opponent teams)
  - Transfer assistant recommendations
  - Any player card/component
- **Action**: Single click/tap to follow
- **Feedback**: Visual indication that player is now followed (icon change, badge, etc.)
- **Limits**: 
  - Maximum of 20 players followed (configurable)
  - Show warning/error if limit reached

#### 1.2 Unfollow a Player
- **Trigger Points**: User can unfollow from:
  - Followed players list
  - Player detail view (if currently following)
  - Any location where follow button appears
- **Action**: Single click/tap to unfollow
- **Feedback**: Visual indication that player is no longer followed
- **Confirmation**: No confirmation needed (quick action)

#### 1.3 Follow Status Indicator
- **Visual Indicator**: Clear visual indication if player is followed:
  - Star icon (filled = following, outline = not following)
  - Heart icon (filled = following, outline = not following)
  - Badge/text label "Following"
- **Consistency**: Same indicator used across all player views
- **Accessibility**: Icon should have aria-label or tooltip

### 2. Followed Players List/View

#### 2.1 Followed Players Dashboard
- **Location**: Accessible from main navigation or Fantasy Football section
- **Display**: List/grid view of all followed players
- **Information Shown**:
  - Player photo
  - Player name
  - Team
  - Position
  - Current FPL price
  - Recent form (last 5 gameweeks)
  - Total FPL points
  - Price change (up/down indicator)
  - Ownership %
  - Upcoming fixture difficulty
  - Quick action buttons (view details, remove from followed)

#### 2.2 Sorting and Filtering
- **Sort Options**:
  - Recently followed (default)
  - Alphabetical (name)
  - Total points
  - Price
  - Form (recent performance)
  - Upcoming fixture difficulty
- **Filter Options**:
  - Position (GK, DEF, MID, FWD)
  - Team
  - Price range
  - Form (good/bad)

#### 2.3 Grouping (Optional)
- Group by position
- Group by team
- Group by form

### 3. Integration with Existing Features

#### 3.1 Player Search
- Show follow status in search results
- Allow follow/unfollow directly from search results
- Highlight followed players in search

#### 3.2 Player Detail View
- Display follow status prominently
- Follow/unfollow button/icon
- Show followed status in player modal

#### 3.3 Transfer Assistant
- Highlight followed players in recommendations
- Allow following from transfer recommendations
- Show "You're following this player" indicator

#### 3.4 Team View
- Show follow status for players in any team view
- Allow following players from opponent teams

#### 3.5 Dashboard Integration
- **Quick Access**: Widget/section showing followed players on dashboard
- **Performance Summary**: Show recent performance of followed players
- **Alerts**: Highlight important updates (price changes, injuries, etc.)

### 4. Data Storage

#### 4.1 Database Model
- New table: `followed_players` or add to existing user preferences
- Fields:
  - `user_id` (FK to users)
  - `player_id` (FPL player ID)
  - `created_at` (timestamp)
  - `notes` (optional - user notes about why following)
- Unique constraint: (user_id, player_id)

#### 4.2 API Endpoints
- `POST /api/fpl/follow-player` - Follow a player
- `DELETE /api/fpl/unfollow-player/{player_id}` - Unfollow a player
- `GET /api/fpl/followed-players` - Get all followed players
- `GET /api/fpl/followed-players/stats` - Get followed players with stats
- `GET /api/fpl/player/{player_id}/follow-status` - Check if player is followed

### 5. Performance and Stats Display

#### 5.1 Followed Players Stats
- Recent form (last 5 gameweeks points)
- Season totals (points, goals, assists, clean sheets, etc.)
- Price trend (graph of price over time)
- Ownership trend
- Next fixtures with difficulty rating
- Injury/suspension status

#### 5.2 Quick Stats Card
- Compact view showing:
  - Photo
  - Name, Team, Position
  - Current price
  - Recent form (points last 3-5 gameweeks)
  - Next fixture
  - Quick actions (view details, remove)

### 6. Notifications (Future Enhancement - Phase 2)

#### 6.1 Notification Preferences
- User preference to enable/disable notifications for followed players
- Per-player notification settings (optional)

#### 6.2 Notification Types
- Price changes
- Goals scored
- Assists
- Yellow/Red cards
- Injuries
- Suspensions
- High FPL points in gameweek

---

## 🎨 UI/UX Requirements

### Design Principles
- **Quick Access**: Follow/unfollow should be immediate (no loading delay)
- **Clear Status**: Always clear if a player is followed or not
- **Visual Consistency**: Same follow indicator used everywhere
- **Non-Intrusive**: Feature should enhance, not clutter the UI
- **Mobile-Friendly**: Easy to follow/unfollow on mobile devices

### Visual Design
- **Follow Button/Icon**: 
  - Location: Player card, player detail view, search results
  - Style: Icon button (star/heart) or text button "Follow"
  - States: Following (filled/active), Not Following (outline/inactive)
  - Hover: Show tooltip "Follow [Player Name]" or "Unfollow [Player Name]"

- **Followed Players List**:
  - Card-based layout
  - Responsive grid (mobile: 1 column, tablet: 2 columns, desktop: 3-4 columns)
  - Compact information display
  - Quick action buttons

### Accessibility
- Icon buttons should have text labels or aria-labels
- Keyboard navigation support
- Screen reader friendly
- Color contrast requirements (WCAG AA)

---

## 🔒 Technical Requirements

### Backend

#### Database Schema
```python
class FollowedPlayer(SQLModel, table=True):
    __tablename__ = "followed_players"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    player_id: int = Field(index=True)  # FPL player ID
    notes: Optional[str] = None  # Optional user notes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint("user_id", "player_id", name="unique_user_player_follow"),
    )
```

#### API Endpoints

1. **Follow Player**
   - `POST /api/fpl/follow-player`
   - Body: `{ "player_id": int }`
   - Response: `{ "success": bool, "message": str }`
   - Error handling: Max limit reached, already following, invalid player

2. **Unfollow Player**
   - `DELETE /api/fpl/unfollow-player/{player_id}`
   - Response: `{ "success": bool, "message": str }`

3. **Get Followed Players**
   - `GET /api/fpl/followed-players`
   - Response: List of followed players with basic info
   - Optional query params: `include_stats=true` (include FPL stats)

4. **Get Followed Players with Stats**
   - `GET /api/fpl/followed-players/stats`
   - Response: Followed players with current FPL stats, form, fixtures
   - Includes: points, price, ownership, form, next fixtures

5. **Check Follow Status**
   - `GET /api/fpl/player/{player_id}/follow-status`
   - Response: `{ "is_followed": bool, "followed_at": datetime | null }`

#### Business Logic
- Enforce maximum follow limit (default: 20)
- Validate player_id exists in FPL data
- Handle edge cases (player deleted, user deleted, etc.)
- Efficient queries (index on user_id, player_id)

### Frontend

#### Components

1. **FollowButton Component**
   - Props: `playerId`, `isFollowed`, `onToggle`
   - Displays follow/unfollow icon/button
   - Handles click and calls API
   - Shows loading state during API call

2. **FollowedPlayersList Component**
   - Displays list of followed players
   - Fetching and display logic
   - Sorting and filtering UI
   - Empty state when no players followed

3. **FollowedPlayerCard Component**
   - Displays single followed player
   - Shows key stats and info
   - Quick actions (view details, unfollow)

4. **FollowedPlayersWidget Component** (Dashboard)
   - Compact view for dashboard
   - Shows top 3-5 followed players
   - Link to full list

#### API Integration
- Add methods to `fplApi` in `frontend/src/lib/api.ts`:
  - `followPlayer(playerId)`
  - `unfollowPlayer(playerId)`
  - `getFollowedPlayers()`
  - `getFollowedPlayersWithStats()`
  - `checkFollowStatus(playerId)`

#### State Management
- Cache followed players list
- Update UI optimistically (immediate feedback)
- Sync with backend
- Handle errors gracefully

---

## 📊 Data Requirements

### Player Data Needed
- FPL player ID (primary key)
- Player name
- Team
- Position
- Photo
- Current price
- Recent form
- Total points
- Ownership %
- Injury status
- Next fixtures

### User Data
- User ID
- Followed players list
- Follow timestamps
- Optional: User notes per player

---

## ✅ Acceptance Criteria

### Follow/Unfollow
- ✅ User can follow a player from player detail view
- ✅ User can follow a player from player search results
- ✅ User can unfollow a player from followed players list
- ✅ Visual indicator shows follow status correctly
- ✅ Maximum follow limit is enforced (20 players)
- ✅ Error messages are clear and helpful

### Followed Players List
- ✅ All followed players are displayed
- ✅ Key stats are shown for each player
- ✅ Sorting works correctly
- ✅ Filtering works correctly
- ✅ Empty state is shown when no players followed
- ✅ List is responsive (mobile, tablet, desktop)

### Integration
- ✅ Follow status shows in player detail view
- ✅ Follow status shows in search results
- ✅ Followed players are highlighted in transfer assistant
- ✅ Dashboard widget shows followed players (if implemented)

### Performance
- ✅ Follow/unfollow actions are fast (< 500ms)
- ✅ Followed players list loads quickly (< 2s)
- ✅ API responses are efficient
- ✅ UI updates optimistically

### Edge Cases
- ✅ Handles invalid player IDs gracefully
- ✅ Handles network errors gracefully
- ✅ Handles maximum limit reached
- ✅ Handles already following/unfollowing

---

## 🚀 Implementation Phases

### Phase 1: MVP (Core Functionality)
- Follow/unfollow players
- Followed players list view
- Basic stats display
- Integration with player detail view
- API endpoints

### Phase 2: Enhanced Features
- Dashboard widget
- Advanced sorting and filtering
- Player notes
- Integration with transfer assistant
- Enhanced stats display

### Phase 3: Advanced Features
- Notifications for followed players
- Price change alerts
- Performance tracking over time
- Comparison tools
- Export followed players list

---

## 📝 Notes

- **Follow Limit**: Start with 20 players, make it configurable
- **Future Enhancement**: Consider "watchlist" vs "followed" distinction
- **Privacy**: Followed players list is private to user
- **Performance**: Consider caching player stats for followed players
- **Analytics**: Track which players are most followed (anonymized)

---

## 🎯 Success Metrics

### Adoption Metrics
- % of users who follow at least one player
- Average number of players followed per user
- Follow/unfollow actions per user per week

### Engagement Metrics
- Views of followed players list
- Time spent viewing followed players
- Clicks from followed players list to player details

### Business Metrics
- Impact on transfer decisions
- User retention for users who follow players
- Feature usage correlation with app engagement

---

## 📚 Related Features

- Player Search
- Player Detail View
- Transfer Assistant
- Dashboard
- Notifications (future)

---

**Document Status**: ✅ Requirements Complete  
**Next**: Create UI Designer handoff document


