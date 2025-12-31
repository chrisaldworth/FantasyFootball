# Weekly Picks Gameweek Validation - Developer Handoff
**Date**: 2025-12-21  
**Status**: Ready for Development  
**Priority**: P1 (High)  
**Handoff From**: Product & Project Management  
**Handoff To**: Developer

---

## 🎯 Quick Overview

**Issue**: Weekly picks submission for gameweek 18 is not working properly. User submitted picks but they don't appear to be saved/working correctly.

**Root Cause**: Missing gameweek validation in the submission endpoint - system accepts any gameweek without checking if it's valid, if deadline has passed, or if it matches current gameweek.

**Solution**: Add comprehensive gameweek validation to the submission endpoint and improve frontend validation/error handling.

**Full Bug Report**: See `weekly-picks-gameweek-validation-bug.md` for complete details.

---

## 🔧 What Needs to Be Fixed

### Backend (`backend/app/api/weekly_picks.py`)

1. **Add Gameweek Validation Function**
   - Validate gameweek exists in FPL events
   - Check if gameweek is current or next available
   - Check if deadline has passed (first fixture kickoff time)
   - Return clear validation results

2. **Update `/submit` Endpoint**
   - Call validation function before processing
   - Return appropriate HTTP errors with clear messages
   - Include current gameweek in error response

3. **Error Handling Improvements**
   - Handle validation failures gracefully
   - Return helpful error messages
   - Log validation failures for debugging

### Frontend (Weekly Picks Components)

1. **Gameweek Selection**
   - Show only valid gameweeks (current/next)
   - Display deadline information
   - Disable submission after deadline

2. **Error Display**
   - Show validation errors clearly
   - Display current gameweek if submission fails
   - Provide actionable error messages

3. **Submission Feedback**
   - Confirm successful submission
   - Refresh data after submission
   - Show submitted picks immediately

---

## 📋 Implementation Details

### Backend Implementation

#### New Validation Function

Create a new function in `backend/app/api/weekly_picks.py`:

```python
async def validate_gameweek_for_submission(gameweek: int) -> dict:
    """
    Validate that picks can be submitted for the given gameweek.
    
    Returns:
        {
            "valid": bool,
            "error": str | None,
            "current_gameweek": int | None,
            "deadline": str | None
        }
    """
    try:
        # Get bootstrap data
        bootstrap = await fpl_service.get_bootstrap_static()
        events = bootstrap.get("events", [])
        
        # Find target gameweek in events
        target_event = next((e for e in events if e["id"] == gameweek), None)
        if not target_event:
            current_event = next((e for e in events if e.get("is_current")), None)
            return {
                "valid": False,
                "error": f"Gameweek {gameweek} not found. Valid gameweeks are 1-{len(events)}",
                "current_gameweek": current_event["id"] if current_event else None,
            }
        
        # Get current gameweek
        current_event = next((e for e in events if e.get("is_current")), None)
        if not current_event:
            return {
                "valid": False,
                "error": "No current gameweek found",
                "current_gameweek": None,
            }
        
        current_gameweek = current_event["id"]
        
        # Validate gameweek is current or next
        if gameweek < current_gameweek:
            return {
                "valid": False,
                "error": f"Cannot submit picks for past gameweek {gameweek}. Current gameweek is {current_gameweek}",
                "current_gameweek": current_gameweek,
            }
        
        if gameweek > current_gameweek + 1:
            return {
                "valid": False,
                "error": f"Cannot submit picks for gameweek {gameweek}. Next available gameweek is {current_gameweek + 1}",
                "current_gameweek": current_gameweek,
            }
        
        # Check if deadline has passed (check first fixture kickoff time)
        fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
        if fixtures:
            # Get first fixture by kickoff time
            fixtures_with_time = [f for f in fixtures if f.get("kickoff_time")]
            if fixtures_with_time:
                first_fixture = min(fixtures_with_time, key=lambda f: f["kickoff_time"])
                kickoff_time_str = first_fixture.get("kickoff_time")
                if kickoff_time_str:
                    from datetime import datetime
                    deadline = datetime.fromisoformat(kickoff_time_str.replace('Z', '+00:00'))
                    now = datetime.now(deadline.tzinfo)
                    if now > deadline:
                        deadline_str = deadline.strftime("%Y-%m-%d %H:%M")
                        return {
                            "valid": False,
                            "error": f"Submission deadline for gameweek {gameweek} has passed (deadline: {deadline_str})",
                            "current_gameweek": current_gameweek,
                            "deadline": deadline_str,
                        }
        
        return {
            "valid": True,
            "current_gameweek": current_gameweek,
        }
    except Exception as e:
        print(f"[Weekly Picks] Error validating gameweek: {e}")
        return {
            "valid": False,
            "error": f"Error validating gameweek: {str(e)}",
            "current_gameweek": None,
        }
```

#### Update Submit Endpoint

Modify the `submit_picks` function (around line 91):

```python
@router.post("/submit")
async def submit_picks(
    gameweek: int,
    scorePredictions: List[dict],
    playerPicks: List[dict],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Submit weekly picks for a gameweek"""
    try:
        # Validate gameweek FIRST
        validation = await validate_gameweek_for_submission(gameweek)
        if not validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation["error"]
            )
        
        # ... rest of existing validation and submission logic ...
```

### Frontend Implementation

#### Update Weekly Picks Submission Component

1. **Get Valid Gameweeks**
   - Fetch bootstrap data
   - Identify current gameweek
   - Show only current and next gameweek options

2. **Display Deadline**
   - Show deadline for selected gameweek
   - Disable submit button after deadline
   - Show countdown timer if before deadline

3. **Error Handling**
   - Display validation errors from backend
   - Show current gameweek in error message
   - Provide clear guidance on what gameweek to use

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Test submission for current gameweek (before deadline) → Should succeed
- [ ] Test submission for past gameweek → Should be rejected
- [ ] Test submission for gameweek > current + 1 → Should be rejected
- [ ] Test submission after deadline → Should be rejected
- [ ] Test submission for invalid gameweek (e.g., 99) → Should be rejected
- [ ] Test submission for gameweek that doesn't exist → Should be rejected
- [ ] Verify error messages are clear and helpful
- [ ] Verify current_gameweek is included in error responses

### Frontend Tests

- [ ] Only valid gameweeks are shown in selector
- [ ] Deadline is displayed correctly
- [ ] Submit button is disabled after deadline
- [ ] Error messages are displayed clearly
- [ ] Successful submission shows confirmation
- [ ] Picks are displayed after submission

### Integration Tests

- [ ] End-to-end submission flow works
- [ ] User's gameweek 18 issue is resolved
- [ ] Picks are saved correctly in database
- [ ] Picks can be retrieved correctly

---

## 🐛 Debugging Gameweek 18 Issue

For the immediate issue with gameweek 18:

1. **Check Database**
   ```sql
   SELECT * FROM weekly_picks WHERE gameweek = 18;
   SELECT * FROM score_predictions WHERE weekly_pick_id IN (SELECT id FROM weekly_picks WHERE gameweek = 18);
   SELECT * FROM player_picks WHERE weekly_pick_id IN (SELECT id FROM weekly_picks WHERE gameweek = 18);
   ```

2. **Check FPL API**
   - What is current gameweek?
   - Does gameweek 18 exist?
   - What is gameweek 18's deadline?
   - Have gameweek 18 fixtures started?

3. **Check User's Submission**
   - When did user submit?
   - What gameweek did they submit for?
   - Were there any errors?
   - Are picks in database?

4. **Fix User's Picks (if needed)**
   - If picks are saved incorrectly, may need to fix data
   - If picks are missing, may need to allow manual correction
   - Document what went wrong for future prevention

---

## ✅ Acceptance Criteria

Fix is complete when:

1. ✅ Gameweek validation is implemented and working
2. ✅ Submissions for invalid gameweeks are rejected with clear errors
3. ✅ Deadline validation prevents late submissions
4. ✅ Error messages include current gameweek and helpful guidance
5. ✅ Frontend shows only valid gameweeks
6. ✅ Frontend displays deadline information
7. ✅ User's gameweek 18 issue is resolved
8. ✅ All test cases pass
9. ✅ No regression in existing functionality

---

## 📚 Reference Documentation

- **Bug Report**: `weekly-picks-gameweek-validation-bug.md`
- **Weekly Picks API**: `backend/app/api/weekly_picks.py`
- **Weekly Picks Models**: `backend/app/models/weekly_picks.py`
- **FPL Service**: `backend/app/services/fpl_service.py`

---

## 🚀 Next Steps

1. **Investigate gameweek 18 issue** (check database, FPL API, user data)
2. **Implement gameweek validation function**
3. **Update submit endpoint** to use validation
4. **Update frontend** for better gameweek selection and error handling
5. **Test thoroughly** including user's specific case
6. **Fix user's gameweek 18 picks** if needed

---

**Document Status**: ✅ Ready for Developer  
**Next**: Developer Agent - Investigate and implement fixes


