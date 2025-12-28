# Weekly Picks - Gameweek 18 Validation Bug Report
**Date**: 2025-12-21  
**Priority**: P1 (High)  
**Status**: Bug Report - Needs Investigation  
**Reported By**: User  
**Assigned To**: Developer Agent

---

## 🐛 Bug Summary

Weekly picks submission for gameweek 18 is not working properly. User made picks recently but they don't seem to have been saved or processed correctly for gameweek 18.

---

## 🔍 Issue Description

### User Report
- User submitted picks for gameweek 18
- Picks do not appear to be working/saved correctly
- Uncertain if picks were saved, if gameweek validation failed, or if there's a display issue

### Expected Behavior
- User should be able to submit picks for the current/upcoming gameweek
- System should validate that gameweek is valid and submission deadline hasn't passed
- Submitted picks should be saved and visible in the UI
- Picks should be associated with the correct gameweek

### Actual Behavior
- Picks for gameweek 18 appear not to be working
- Unclear if picks were rejected, saved incorrectly, or display issue

---

## 🔎 Investigation Needed

### Potential Root Causes

1. **Missing Gameweek Validation**
   - Current code accepts `gameweek` parameter without validation
   - No check if gameweek is valid (exists in FPL)
   - No check if gameweek deadline has passed
   - No check if gameweek matches current/upcoming gameweek

2. **Gameweek Mismatch**
   - Frontend might be sending wrong gameweek number
   - Backend might be using wrong gameweek from FPL API
   - Mismatch between user's selected gameweek and system's current gameweek

3. **Deadline Validation Missing**
   - No check if picks can still be submitted for the gameweek
   - Should check FPL fixture deadlines before accepting picks

4. **Database/Data Issues**
   - Picks might be saved but not retrieved correctly
   - Gameweek value might be incorrect in database
   - Relationship between WeeklyPick and related tables might be broken

5. **Frontend Display Issue**
   - Picks might be saved correctly but not displayed
   - Frontend might be querying wrong gameweek
   - Frontend might not be refreshing after submission

---

## 📋 Code Analysis

### Backend Code (`backend/app/api/weekly_picks.py`)

**Current Implementation:**
- `/submit` endpoint accepts `gameweek: int` parameter directly
- No validation that gameweek is valid
- No check if gameweek deadline has passed
- No validation against FPL API for current gameweek

**Lines 91-188 (`submit_picks` function):**
```python
@router.post("/submit")
async def submit_picks(
    gameweek: int,  # No validation!
    scorePredictions: List[dict],
    playerPicks: List[dict],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # ... validation for picks count ...
    # ... no validation for gameweek ...
```

### Missing Validations

1. **Gameweek Exists Check**
   - Should validate gameweek exists in FPL bootstrap data
   - Should check if gameweek is in valid range (1-38 for PL season)

2. **Deadline Check**
   - Should check if gameweek's first fixture has started
   - Should check FPL deadline (kickoff time of first fixture)
   - Should reject submissions after deadline

3. **Current Gameweek Validation**
   - Should validate gameweek is current or next available
   - Should prevent submissions for past gameweeks
   - Should handle edge cases (between gameweeks, season end, etc.)

---

## ✅ Required Fixes

### Backend Changes Required

1. **Add Gameweek Validation Function**
   ```python
   async def validate_gameweek_for_submission(gameweek: int) -> dict:
       """
       Validate that picks can be submitted for the given gameweek
       Returns: {"valid": bool, "error": str, "current_gameweek": int}
       """
       # Get bootstrap data
       bootstrap = await fpl_service.get_bootstrap_static()
       events = bootstrap.get("events", [])
       
       # Find gameweek in events
       target_event = next((e for e in events if e["id"] == gameweek), None)
       if not target_event:
           return {"valid": False, "error": "Gameweek not found"}
       
       # Get current gameweek
       current_event = next((e for e in events if e.get("is_current")), None)
       if not current_event:
           return {"valid": False, "error": "No current gameweek"}
       
       current_gameweek = current_event["id"]
       
       # Validate gameweek is current or next
       if gameweek < current_gameweek:
           return {"valid": False, "error": "Cannot submit picks for past gameweek"}
       
       if gameweek > current_gameweek + 1:
           return {"valid": False, "error": "Cannot submit picks for future gameweeks beyond next"}
       
       # Check if deadline has passed (check first fixture kickoff time)
       fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
       if fixtures:
           first_fixture = min(fixtures, key=lambda f: f.get("kickoff_time", ""))
           kickoff_time = first_fixture.get("kickoff_time")
           if kickoff_time:
               from datetime import datetime
               deadline = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00'))
               if datetime.now(deadline.tzinfo) > deadline:
                   return {"valid": False, "error": "Submission deadline has passed"}
       
       return {"valid": True, "current_gameweek": current_gameweek}
   ```

2. **Update Submit Endpoint**
   - Call validation function before processing
   - Return appropriate error messages
   - Handle validation errors gracefully

3. **Improve Error Messages**
   - Return clear error messages when validation fails
   - Include current gameweek in error response
   - Indicate why submission was rejected

### Frontend Changes Required

1. **Gameweek Selection Validation**
   - Show only valid gameweeks (current/next)
   - Display deadline information
   - Disable submission after deadline

2. **Error Handling**
   - Display validation errors clearly
   - Show current gameweek if submission fails
   - Provide helpful error messages

3. **Submission Feedback**
   - Confirm successful submission
   - Refresh data after submission
   - Show submitted picks immediately

---

## 🧪 Testing Requirements

### Test Cases

1. **Valid Submission**
   - Submit picks for current gameweek before deadline → Should succeed

2. **Past Gameweek**
   - Attempt to submit for past gameweek → Should be rejected with error

3. **Future Gameweek (Too Far)**
   - Attempt to submit for gameweek beyond next → Should be rejected

4. **After Deadline**
   - Attempt to submit after gameweek deadline → Should be rejected with deadline message

5. **Invalid Gameweek**
   - Submit with gameweek that doesn't exist (e.g., 99) → Should be rejected

6. **Edge Cases**
   - Between gameweeks (one finished, next not started)
   - Season end (gameweek 38)
   - Gameweek with no fixtures

---

## 📊 Data to Collect for Debugging

1. **User's Submission Data**
   - What gameweek did user submit for?
   - When did they submit?
   - What was the error message (if any)?

2. **Database Check**
   - Are picks saved in database for gameweek 18?
   - What user_id?
   - What gameweek value is stored?
   - Are related ScorePrediction and PlayerPick records created?

3. **FPL API Check**
   - What is the current gameweek according to FPL API?
   - What are the gameweek 18 fixtures?
   - What is the deadline for gameweek 18?

4. **Frontend State**
   - What gameweek does frontend think is current?
   - Does frontend show picks for gameweek 18?
   - Are there any console errors?

---

## 🎯 Acceptance Criteria

The bug is fixed when:

1. ✅ System validates gameweek before accepting submissions
2. ✅ Submissions for past gameweeks are rejected
3. ✅ Submissions after deadline are rejected with clear message
4. ✅ Current gameweek is correctly identified from FPL API
5. ✅ Error messages are clear and helpful
6. ✅ Valid submissions work correctly
7. ✅ Frontend displays appropriate gameweek options
8. ✅ Frontend shows deadline information
9. ✅ User's gameweek 18 picks issue is resolved

---

## 📝 Next Steps

1. **Developer Agent**: Investigate the specific gameweek 18 issue
   - Check database for user's picks
   - Check FPL API for current gameweek
   - Identify root cause

2. **Developer Agent**: Implement gameweek validation
   - Add validation function
   - Update submit endpoint
   - Add error handling

3. **Developer Agent**: Update frontend
   - Add gameweek validation UI
   - Improve error messages
   - Add deadline display

4. **Tester Agent**: Test fixes
   - Test all validation scenarios
   - Verify user's gameweek 18 picks work
   - Test edge cases

---

## 📚 Related Documentation

- Weekly Picks Requirements: `docs/features/weekly-picks/weekly-picks-complete-design-brief.md`
- Weekly Picks API: `backend/app/api/weekly_picks.py`
- Weekly Picks Models: `backend/app/models/weekly_picks.py`

---

**Document Status**: ✅ Bug Report Complete  
**Next**: Hand off to Developer Agent for investigation and fix

