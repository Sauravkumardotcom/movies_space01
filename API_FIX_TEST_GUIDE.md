# 🧪 API Fixes - Quick Test Guide

## Quick Verification Checklist

### 1. Check API URLs (No Double Prefixes)
```bash
# In browser Network tab, look for:
✅ /api/v1/notifications             (CORRECT)
❌ /api/v1/api/v1/notifications      (WRONG - FIXED)

✅ /api/v1/comments                  (CORRECT)
❌ /api/v1/api/v1/comments           (WRONG - FIXED)
```

### 2. Test Notifications Page
```
Actions to test:
□ Click on notifications bell icon
□ Should NOT show 404 errors
□ Should NOT crash with "h.map is not a function"
□ Should display "No notifications" or list notifications
□ Mark all as read button should work
□ Individual notification marking should work
```

### 3. Check Browser Console
```javascript
// ✅ SHOULD SEE - Successful API calls
✅ GET /api/v1/notifications 200

// ✅ SHOULD SEE - Detailed error info if something fails
⚠️ 404 Error: GET /api/v1/nonexistent

// ❌ SHOULD NOT SEE
TypeError: h.map is not a function
401 Unauthorized without proper error handling
```

### 4. Test Each Fixed Service
```bash
# Notifications
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/notifications

# Comments  
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/comments

# Search
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/search

# Social
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/social

# Engagement
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/engagement

# Admin
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/admin
```

### 5. Login Flow (Should Still Work)
```
□ Navigate to Login page
□ Enter credentials
□ Should see login success (not error)
□ Should redirect to dashboard
□ Notifications should load in next page
```

---

## Expected Results After Fixes

| Feature | Before Fix | After Fix |
|---------|-----------|-----------|
| **Notifications Load** | ❌ 404 Error | ✅ Loads successfully |
| **Notifications Display** | ❌ TypeError: h.map | ✅ Renders list or "No notifications" |
| **Error Logging** | ❌ Silent failures | ✅ Detailed console logs |
| **Empty Data Handling** | ❌ Crashes | ✅ Shows fallback message |
| **API URLs** | ❌ Double prefix | ✅ Correct single prefix |

---

## Debugging Tips

If issues persist:

### 1. Check VITE_API_URL environment variable
```bash
# Should be exactly:
VITE_API_URL=http://localhost:3000/api/v1

# NOT:
VITE_API_URL=http://localhost:3000   # ❌ Missing /api/v1
VITE_API_URL=http://localhost:3000/api/v1/notifications # ❌ Too much
```

### 2. Monitor Network Tab
```
Open DevTools → Network tab → Filter "notifications"
Should see:
- URL: http://localhost:3000/api/v1/notifications
- Status: 200 OK (or 401 if not authenticated)
- Headers: Authorization: Bearer <token>
```

### 3. Check Console for Logs
```javascript
// You should see logs like:
console.log("✅ GET /api/v1/notifications", 200)
console.error("Notification API Error:", 404, {...})
```

### 4. Test with curl
```bash
# Get your token first
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# Test notifications endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/notifications?page=1&limit=20"
```

---

## Files Modified

### Services (API correction)
- ✅ `frontend/src/services/notification.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/comment.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/admin.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/engagement.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/search.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/social.ts` - Fixed URL + error handling
- ✅ `frontend/src/services/api.ts` - Enhanced error logging

### Components (UI safety)
- ✅ `frontend/src/components/notifications/NotificationBell.tsx` - Added array guards
- ✅ `frontend/src/pages/NotificationsPage.tsx` - Added array guards

---

## Success Metrics

After fixes, verify:
- ✅ Zero 404 errors for `/api/v1/api/v1/*` URLs
- ✅ Zero "TypeError: h.map is not a function" crashes
- ✅ All API errors logged to console with details
- ✅ UI gracefully handles missing/invalid data
- ✅ Notifications feature works end-to-end
- ✅ Login still works perfectly
- ✅ No error boundaries triggered

**When all pass → Production Ready! 🚀**
