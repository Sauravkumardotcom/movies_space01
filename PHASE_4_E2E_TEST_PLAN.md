# Phase 4: End-to-End Testing Plan

**Date**: February 8, 2026  
**Status**: In Progress  
**Target**: Validate all critical user flows

---

## Test Scenarios

### 1. Authentication Flow
**Objective**: Verify signup → login → authenticated access

```
Flow:
1. User visits /signup
2. Fills signup form with valid credentials
3. Creates account successfully
4. Redirected to login
5. Logs in with credentials
6. Redirected to home (/dashboard or /)
7. Can access protected routes
```

**Expected State**:
- ✅ User created in database
- ✅ JWT token issued
- ✅ User stored in auth store
- ✅ Protected routes accessible
- ✅ User profile displays correctly

---

### 2. Watchlist Operations Flow
**Objective**: Verify add → show → remove → persistence

```
Flow:
1. User navigates to /movies
2. Clicks "Add to Watchlist" on a movie
3. Button state changes to "Remove"
4. User navigates to /watchlist
5. Movie appears in watchlist
6. User refreshes page
7. Movie still in watchlist (persistence)
8. User clicks "Remove"
9. Movie removed from watchlist
10. Refreshes again - movie gone
```

**Expected State**:
- ✅ Mutation completes successfully
- ✅ UI reflects changes immediately
- ✅ Data persisted in database
- ✅ State synced across pages
- ✅ Pagination works correctly

---

### 3. Notification System Flow
**Objective**: Verify notification fetch → display → mark read

```
Flow:
1. User has notifications in system
2. User navigates to /notifications
3. Notifications load and display
4. Each notification shows correctly
5. User clicks "Mark as read" on notification
6. Notification UI updates
7. Count badge decreases
8. Filter by read/unread works
```

**Expected State**:
- ✅ Notifications fetch correctly
- ✅ Proper pagination
- ✅ Mark read mutation works
- ✅ Real-time UI updates
- ✅ Filter logic working

---

### 4. Movie Detail Page Flow
**Objective**: Verify detail load → error handling → interactions

```
Flow:
1. User navigates to /movie/:id (valid ID)
2. Movie details load with rating, comments, etc.
3. Add to Watchlist/Favorites works
4. User tries /movie/:id (invalid ID)
5. Shows error message
6. User tries /movie (no ID)
7. Shows error message or redirects
```

**Expected State**:
- ✅ Movie data loads correctly
- ✅ Comments render properly
- ✅ Rating controls work
- ✅ Error handling graceful
- ✅ Related items display
- ✅ Progress bar shows if exists

---

### 5. Search Flow
**Objective**: Verify search functionality end-to-end

```
Flow:
1. User types in SearchBar
2. Results appear after 300ms (debounce)
3. Clicking result navigates to detail
4. Full search results show correctly
5. Results paginate properly
6. Trending tab shows content
7. Filter tabs work
```

**Expected State**:
- ✅ Debounce working (300ms)
- ✅ Results filtered correctly
- ✅ Pagination functional
- ✅ All entity types searchable
- ✅ Loading states show

---

### 6. Favorites Management Flow
**Objective**: Verify favorites CRUD operations

```
Flow:
1. User navigates to /favorites
2. Filter by entity type (all/movies/music)
3. Add item to favorites from detail page
4. Item appears in /favorites
5. Remove from favorites
6. Disappears from page
7. Pagination works
```

**Expected State**:
- ✅ Filters work correctly
- ✅ Mutations complete
- ✅ UI reflects changes
- ✅ Pagination updates
- ✅ Count display accurate

---

### 7. Upload Flow
**Objective**: Verify upload functionality

```
Flow:
1. User navigates to /uploads
2. Existing uploads display
3. User can view upload details
4. S3 link resolves correctly
5. Delete upload works (with confirm)
6. Pagination works
```

**Expected State**:
- ✅ Existing uploads load
- ✅ Upload list displays
- ✅ Delete mutation works
- ✅ State updates properly
- ✅ S3 URLs accessible

---

### 8. Admin Panel Flow (if admin user)
**Objective**: Verify admin-only access and functionality

```
Flow:
1. Regular user cannot access /admin
2. Admin user accesses /admin
3. Admin dashboard loads
4. Stats display correctly
5. Users list shows
6. Ban/moderation features work
```

**Expected State**:
- ✅ Route protection working
- ✅ Admin data loads
- ✅ Mutations work
- ✅ No permission errors
- ✅ UI displays correctly

---

## Test Results Summary

| Flow | Status | Notes |
|------|--------|-------|
| Auth (signup/login) | ⭕ | Pending |
| Watchlist | ⭕ | Pending |
| Notifications | ⭕ | Pending |
| Movie Detail | ⭕ | Pending |
| Search | ⭕ | Pending |
| Favorites | ⭕ | Pending |
| Uploads | ⭕ | Pending |
| Admin Panel | ⭕ | Pending |

---

## Validation Checklist

- [ ] All HTTP requests successful (200, 201, etc.)
- [ ] No console errors or warnings
- [ ] Loading states appear/disappear correctly
- [ ] Error messages display properly
- [ ] Data persists after page refresh
- [ ] Pagination works on all paginated endpoints
- [ ] UI updates immediately after mutations
- [ ] Protected routes require authentication
- [ ] Form validation works
- [ ] Image/media loads without issues
- [ ] Responsive design intact (mobile/tablet/desktop)
- [ ] No memory leaks (React Query cleanup)

---

## Known Issues to Verify

1. npm build failing (dependency issue) - **Not blocking E2E tests**
2. S3 integration incomplete - Verify mock/placeholder works
3. Social features minimal - Verify graceful handling

---

## Conclusion Template

**All E2E tests PASSED ✅** - Ready for Phase 5 (UI consistency review)

OR

**Some flows FAILED ❌** - Requires debugging before proceeding
