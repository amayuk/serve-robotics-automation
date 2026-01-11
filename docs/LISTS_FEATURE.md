# 🎬 TMDB Lists Feature Documentation

## Overview
Complete implementation of TMDB Lists functionality - create, manage, and organize custom movie lists.

---

## ✅ What Was Added

### 1. **Service Methods** (`TMDBListsService.js`)

```javascript
// Add movie to list
await listsService.addMovieToList(listId, movieId);

// Remove movie from list
await listsService.removeMovieFromList(listId, movieId);

// Get list details
await listsService.getListDetails(listId);

// Check if movie is in list
await listsService.checkMovieInList(listId, movieId);

// Create a new list
await listsService.createList(name, description, language);

// Delete a list
await listsService.deleteList(listId);

// Clear all items from list
await listsService.clearList(listId);
```

### 2. **Test Cases** (`tmdb.api.spec.js`)

| Test Case | Description | Validates |
|-----------|-------------|-----------|
| **TC35** | Add movie to list | Success response, status codes 1 or 12 |
| **TC36** | Remove movie from list | Success response, status codes 1 or 13 |
| **TC37** | Get list details | List metadata and items array |
| **TC38** | Add multiple movies | Sequential additions work |
| **TC39** | List response structure | All required fields present |
| **TC40** | Check movie in list | item_present boolean field |
| **TC41** | Response time validation | Operations complete quickly |
| **TC42** | Toggle movie in list | Add and remove work consecutively |
| **TC43** | **Complete list lifecycle** | **Full workflow: create → add → check → remove → delete** |

**⚠️ Note:** TC35-TC42 require a pre-existing list ID. **TC43 is recommended** as it's fully self-contained and doesn't require setup!

---

## 📊 API Endpoint Details

### **Add Movie to List**
```http
POST /list/{list_id}/add_item
Authorization: Bearer {token}
Content-Type: application/json

{
  "media_id": 18
}
```

### **Response (Success)**
```json
{
  "status_code": 12,
  "status_message": "The item/record was updated successfully."
}
```

### **Remove Movie from List**
```http
POST /list/{list_id}/remove_item
Authorization: Bearer {token}
Content-Type: application/json

{
  "media_id": 18
}
```

### **Get List Details**
```http
GET /list/{list_id}
Authorization: Bearer {token}
```

### **Response**
```json
{
  "id": "8310547",
  "name": "My Awesome Movies",
  "description": "A collection of must-watch films",
  "items": [
    {
      "id": 18,
      "title": "The Fifth Element",
      ...
    }
  ],
  "item_count": 15,
  "iso_639_1": "en",
  "list_type": "movie"
}
```

---

## 🎯 Status Code Reference

| Status Code | Meaning | When |
|------------|---------|------|
| `1` | Success | Item added/removed successfully |
| `12` | Item updated successfully | Item already in list (add operation) |
| `13` | Item deleted successfully | Item already removed (remove operation) |

---

## 🧪 Running the Tests

```bash
# Run TC43 - Complete lifecycle test (RECOMMENDED - No setup required!)
npx playwright test --grep "TC43"

# Run all list tests (requires pre-existing list ID in TestDataProvider)
npx playwright test --grep "Lists Endpoint"

# Run specific test cases
npx playwright test --grep "TC35"
npx playwright test --grep "TC36"

# Run TC35-TC42 (requires list ID setup)
npx playwright test --grep "TC35|TC36|TC37|TC38|TC39|TC40|TC41|TC42"

# Run TC43 only (self-contained, no setup needed)
npx playwright test --grep "TC43"
```

### **✨ Recommended: Run TC43**
TC43 is a complete end-to-end workflow test that:
- ✅ Creates its own list
- ✅ Adds and removes movies
- ✅ Verifies all operations
- ✅ Cleans up after itself
- ✅ **No manual setup required!**

```bash
npx playwright test --grep "TC43"
```

---

## 📝 Test Data

### **Test List ID** ⚠️ **IMPORTANT**
```javascript
TestDataProvider.LISTS.TEST_LIST = 8310547
```

**⚠️ You MUST update this with your own list ID!**

The list tests (TC35-TC42) will fail with **401 Unauthorized** if you use the default ID because:
- Lists are user-specific and private
- The default list ID doesn't belong to your account
- TMDB API requires the list to be owned by the authenticated user

### **How to Get Your List ID**

#### **Option 1: Create via Script (Recommended)**
```bash
# Run the helper script
node scripts/create-test-list.js

# Copy the list ID from output
# Update TestDataProvider.LISTS.TEST_LIST with your ID
```

#### **Option 2: Create via TMDB Website**
1. Go to [TMDB.org](https://www.themoviedb.org/) and log in
2. Navigate to Your Profile → Lists
3. Create a new list or use existing
4. Copy the ID from URL: `themoviedb.org/list/YOUR_LIST_ID`
5. Update `TestDataProvider.LISTS.TEST_LIST`

#### **Option 3: Use API Directly**
```bash
# Create list
curl -X POST "https://api.themoviedb.org/3/list" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test List","description":"For testing","language":"en"}'

# Response will contain: {"list_id": 123456}
```

### **Movies Used in Tests**
```javascript
The Fifth Element: 18
Inception: 27205
The Dark Knight: 155
The Matrix: 603
Pulp Fiction: 680
Forrest Gump: 13
The Godfather: 238
```

---

## 💡 Usage Examples

### **Basic Usage**
```javascript
test('Add movie to list', async () => {
  const listId = TestDataProvider.LISTS.TEST_LIST;
  const movieId = 18; // The Fifth Element
  
  const response = await listsService.addMovieToList(listId, movieId);
  
  expect([200, 201]).toContain(response.status);
  expect([1, 12]).toContain(response.data.status_code);
});
```

### **Check Before Adding**
```javascript
// Check if movie is already in list
const checkResponse = await listsService.checkMovieInList(listId, movieId);

if (!checkResponse.data.item_present) {
  // Movie not in list, add it
  await listsService.addMovieToList(listId, movieId);
}
```

### **Manage List Contents**
```javascript
// Get current list
const listDetails = await listsService.getListDetails(listId);
console.log(`List has ${listDetails.data.item_count} movies`);

// Add multiple movies
const moviesToAdd = [27205, 155, 603];
for (const movieId of moviesToAdd) {
  await listsService.addMovieToList(listId, movieId);
}

// Remove a movie
await listsService.removeMovieFromList(listId, 18);
```

---

## 🔑 Key Implementation Details

### **Why Accept Multiple Status Codes?**
TMDB API returns different status codes based on current state:
- **Adding** a movie that's **new to the list**: `status_code = 1`
- **Adding** a movie that's **already in the list**: `status_code = 12`
- **Removing** a movie successfully: `status_code = 1`
- **Removing** a movie **already removed**: `status_code = 13`

Both are valid success responses!

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

## 🚀 Creating a New List (Optional)

```javascript
// Create a new list
const createResponse = await listsService.createList(
  'My Favorite Sci-Fi Movies',
  'A curated collection of the best science fiction films',
  'en'
);

const newListId = createResponse.data.list_id;

// Add movies to it
await listsService.addMovieToList(newListId, 603);  // The Matrix
await listsService.addMovieToList(newListId, 157336); // Interstellar
```

---

## 📚 API Methods Reference

| Method | Parameters | Returns |
|--------|-----------|---------|
| `addMovieToList` | listId, mediaId, [queryParams] | Promise<Response> |
| `removeMovieFromList` | listId, mediaId, [queryParams] | Promise<Response> |
| `getListDetails` | listId, [queryParams] | Promise<Response> |
| `checkMovieInList` | listId, movieId | Promise<Response> |
| `createList` | name, description, language, [queryParams] | Promise<Response> |
| `deleteList` | listId, [queryParams] | Promise<Response> |
| `clearList` | listId, [queryParams] | Promise<Response> |

---

## 🎉 Complete Example Test

```javascript
test('Complete list workflow', async () => {
  const listId = TestDataProvider.LISTS.TEST_LIST;
  const movieId = TestDataProvider.MOVIES.INCEPTION;
  
  // 1. Check if movie is in list
  const checkResponse = await listsService.checkMovieInList(listId, movieId);
  console.log(`Movie in list: ${checkResponse.data.item_present}`);
  
  // 2. Add movie to list
  const addResponse = await listsService.addMovieToList(listId, movieId);
  expect([1, 12]).toContain(addResponse.data.status_code);
  
  // 3. Verify it was added
  const verifyResponse = await listsService.checkMovieInList(listId, movieId);
  expect(verifyResponse.data.item_present).toBe(true);
  
  // 4. Get list details
  const listResponse = await listsService.getListDetails(listId);
  expect(listResponse.data.items.length).toBeGreaterThan(0);
  
  // 5. Remove movie from list
  const removeResponse = await listsService.removeMovieFromList(listId, movieId);
  expect([1, 13]).toContain(removeResponse.data.status_code);
});
```

---

## 🔥 **TC43: Complete Lifecycle Test** (Recommended)

This test validates **ALL 7 List API endpoints** in a single workflow:

```javascript
test('TC43 - Complete list lifecycle', async () => {
  // 1. CREATE LIST
  const createResponse = await listsService.createList(
    'My Test List',
    'Automated test list',
    'en'
  );
  const listId = createResponse.data.list_id;
  
  // 2. ADD MOVIES
  const movies = [278, 238, 155]; // Shawshank, Godfather, Dark Knight
  for (const movieId of movies) {
    await listsService.addMovieToList(listId, movieId);
  }
  
  // 3. CHECK ITEM STATUS (for each movie)
  for (const movieId of movies) {
    const check = await listsService.checkMovieInList(listId, movieId);
    expect(check.data.item_present).toBe(true);
  }
  
  // 4. GET LIST DETAILS
  const details = await listsService.getListDetails(listId);
  expect(details.data.item_count).toBeGreaterThanOrEqual(3);
  
  // 5. REMOVE MOVIES (one by one)
  for (const movieId of movies) {
    await listsService.removeMovieFromList(listId, movieId);
  }
  
  // 6. CLEAR LIST (optional - tests clear endpoint)
  const clearResponse = await listsService.clearList(listId);
  expect(clearResponse.data.status_code).toBe(12);
  
  // 7. DELETE LIST
  const deleteResponse = await listsService.deleteList(listId);
  expect(deleteResponse.data.success).toBe(true);
});
```

### **Why TC43 is the Best Test:**
- ✅ Tests **all 7 API endpoints** in one flow
- ✅ No manual setup required
- ✅ Self-contained and isolated
- ✅ Automatic cleanup
- ✅ Perfect for CI/CD pipelines
- ✅ Validates complete list lifecycle

### **Endpoints Tested:**
1. ✅ `POST /list` - Create List
2. ✅ `POST /list/{id}/add_item` - Add Movie
3. ✅ `GET /list/{id}/item_status` - Check Item Status
4. ✅ `GET /list/{id}` - Get List Details
5. ✅ `POST /list/{id}/remove_item` - Remove Movie
6. ✅ `POST /list/{id}/clear` - Clear List
7. ✅ `DELETE /list/{id}` - Delete List

---

---

## 📖 Quick API Reference

### **All List Endpoints**

```javascript
// 1. Check Item Status
GET /list/{list_id}/item_status?movie_id={movie_id}
Response: { "id": 1, "item_present": true }

// 2. Add Movie to List  
POST /list/{list_id}/add_item
Body: { "media_id": 18 }
Response: { "status_code": 12, "status_message": "..." }

// 3. Remove Movie from List
POST /list/{list_id}/remove_item
Body: { "media_id": 18 }
Response: { "status_code": 13, "status_message": "..." }

// 4. Clear List
POST /list/{list_id}/clear?confirm=false
Response: { "status_code": 12, "status_message": "..." }

// 5. Delete List
DELETE /list/{list_id}
Response: { "status_code": 12, "status_message": "..." }

// 6. Create List
POST /list
Body: { "name": "...", "description": "...", "language": "en" }
Response: { "status_code": 1, "list_id": 5861 }

// 7. Get List Details
GET /list/{list_id}
Response: { "id": "5861", "name": "...", "item_count": 3, ... }
```

---

## 📋 References

- [TMDB Lists API Documentation](https://developer.themoviedb.org/reference/list-add-movie)
- [TMDB Error Codes](https://developer.themoviedb.org/docs/errors)
- [Authentication Guide](https://developer.themoviedb.org/docs/authentication-application)

---

**Created:** January 2025  
**Framework Version:** 1.0.0  
**Status:** ✅ Production Ready
