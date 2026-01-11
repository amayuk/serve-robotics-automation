# 🎬 TMDB Watchlist Feature Documentation

## Overview
Complete implementation of TMDB Watchlist functionality in the API automation framework.

---

## ✅ What Was Added

### 1. **Service Methods** (`TMDBAccountService.js`)

```javascript
// Add movie to watchlist
await accountService.addMovieToWatchlist(accountId, movieId, true);

// Remove movie from watchlist
await accountService.addMovieToWatchlist(accountId, movieId, false);

// Add TV show to watchlist
await accountService.addTVShowToWatchlist(accountId, tvShowId, true);

// Remove TV show from watchlist
await accountService.addTVShowToWatchlist(accountId, tvShowId, false);

// Generic method (works for both movies and TV shows)
await accountService.addToWatchlist(accountId, mediaId, 'movie', true);
```

### 2. **Test Cases** (`tmdb.api.spec.js`)

| Test Case | Description | Validates |
|-----------|-------------|-----------|
| **TC29** | Add movie to watchlist | Success response, status codes 1 or 12 |
| **TC30** | Remove movie from watchlist | Success response, status codes 1 or 13 |
| **TC31** | Add TV show to watchlist | Success response for TV media type |
| **TC32** | Remove TV show from watchlist | Success response for TV removal |
| **TC33** | Watchlist response structure | All required fields present |
| **TC34** | Toggle watchlist status | Add and remove operations work consecutively |

### 3. **Constants** (`TMDBConstants.js`)

```javascript
TMDBConstants.STATUS_CODES.SUCCESS                    // 1
TMDBConstants.STATUS_CODES.ITEM_UPDATED_SUCCESSFULLY  // 12
TMDBConstants.STATUS_CODES.ITEM_DELETED_SUCCESSFULLY  // 13

TMDBConstants.VALID_STATUS_CODES.ADD_OPERATION        // [1, 12]
TMDBConstants.VALID_STATUS_CODES.REMOVE_OPERATION     // [1, 13]
```

---

## 📊 API Endpoint Details

### **Add to Watchlist**
```http
POST /account/{account_id}/watchlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "media_type": "movie",  // or "tv"
  "media_id": 11,
  "watchlist": true       // true to add, false to remove
}
```

### **Response (Success)**
```json
{
  "success": true,
  "status_code": 1,        // or 12 if already in watchlist
  "status_message": "Success."
}
```

### **Response Codes**
| Status Code | Meaning |
|------------|---------|
| `1` | Successfully added/removed |
| `12` | Item already exists in watchlist (when adding) |
| `13` | Item already removed from watchlist (when removing) |

---

## 🧪 Running the Tests

```bash
# Run all watchlist tests
npx playwright test --grep "watchlist"

# Run specific test case
npx playwright test --grep "TC29"

# Run TC29-TC34 (all watchlist tests)
npx playwright test --grep "TC29|TC30|TC31|TC32|TC33|TC34"

# Run all account tests including watchlist
npx playwright test --grep "Account Endpoint"
```

---

## 📝 Test Data

### **Movies Used in Tests**
```javascript
Star Wars: 11
The Matrix: 603
Inception: 27205
```

### **TV Shows Used in Tests**
```javascript
Breaking Bad: 1396
Game of Thrones: 1399
```

---

## 🎯 Key Implementation Details

### **Why Accept Multiple Status Codes?**
TMDB API returns different status codes for the same operation:
- **Adding** an item that's **new**: status_code = `1`
- **Adding** an item that's **already in watchlist**: status_code = `12`
- **Removing** an item successfully: status_code = `1`
- **Removing** an item **already removed**: status_code = `13`

Both are valid success responses, so tests accept both.

### **Flexible Assertions**
```javascript
// ✅ Good - accepts both valid success codes
expect([1, 12]).toContain(response.data.status_code);

// ❌ Bad - fails if item already exists
expect(response.data.status_code).toBe(1);
```

---

## 🔧 Environment Variables Required

```bash
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_API_KEY=your_api_key
TMDB_READ_ACCESS_TOKEN=your_bearer_token
```

---

## 🚀 Example Usage in Tests

```javascript
test('Add movie to watchlist', async () => {
  const accountId = TestDataProvider.ACCOUNTS.TEST_ACCOUNT;
  const movieId = 11; // Star Wars
  
  // Add to watchlist
  const response = await accountService.addMovieToWatchlist(
    accountId, 
    movieId, 
    true
  );
  
  // Validate response
  expect([200, 201]).toContain(response.status);
  expect(response.data.success).toBe(true);
  expect([1, 12]).toContain(response.data.status_code);
});
```

---

## 📚 References

- [TMDB API Documentation](https://developer.themoviedb.org/docs)
- [TMDB Error Codes](https://developer.themoviedb.org/docs/errors)
- [Account Watchlist Endpoint](https://developer.themoviedb.org/reference/account-add-to-watchlist)

---

**Created:** January 2025  
**Framework Version:** 1.0.0  
**Status:** ✅ Production Ready
