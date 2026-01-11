# TMDB API Automation Framework

A comprehensive API test automation framework for The Movie Database (TMDB) using Playwright and JavaScript.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install chromium

# 3. Setup environment
cp .env.example .env
# Edit .env and add your TMDB_API_KEY and TMDB_READ_ACCESS_TOKEN

# 4. Validate environment
npm run validate:env

# 5. Generate session ID (one-time, for write operations)
node scripts/generateSessionId.js
```

### Run Tests

```bash
# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run specific test
npx playwright test --grep "TC01"

# View report
npm run report
```

## 📊 Test Coverage - 44 API Tests

### Movies Endpoint (7 tests)
- Get movie details (happy path & error handling)
- Popular movies with pagination
- Top-rated movies across multiple pages
- Movie credits (cast and crew)
- Multi-language support
- Movie recommendations

### Search Endpoint (3 tests)
- Movie search (happy path)
- Empty query validation
- Multi-entity search (movies, TV, people)

### Genres Endpoint (2 tests)
- Movie genres list
- TV genres list

### Account Endpoint (12 tests)
- Account details retrieval
- Avatar structure validation
- ISO codes validation
- Username and name fields
- Response time validation
- Favorite movies with pagination
- Rated movies with ratings
- Watchlist movies structure
- Multiple account lists consistency

### Favorites Endpoint (4 tests)
- Add/remove movies to favorites
- Add/remove TV shows to favorites
- Response structure validation

### Watchlist Endpoint (6 tests)
- Add/remove movies to watchlist
- Add/remove TV shows to watchlist
- Response structure validation
- Toggle watchlist status

### Lists Endpoint (10 tests)
- Create, add, remove, check status, clear, delete lists
- Add multiple movies to list
- List response structure validation
- List operations response time
- Toggle movie in list
- Complete list lifecycle workflow (TC43)
- Extended list lifecycle with alternative data (TC44)

## 🏗 Architecture

### Service Layer Pattern
```
BaseApiClient (HTTP methods + performance tracking)
    ↓
Service Classes
    ├── TMDBMoviesService
    ├── TMDBSearchService
    ├── TMDBGenresService
    ├── TMDBAccountService
    └── TMDBListsService
    ↓
Test Files (44 tests)
    ↓
Helpers & Validators
```

## 📁 Project Structure

```
tmdb-api-automation/
├── src/
│   ├── api/
│   │   ├── base/
│   │   │   └── BaseApiClient.js       # HTTP methods, performance tracking
│   │   ├── services/
│   │   │   ├── TMDBMoviesService.js
│   │   │   ├── TMDBSearchService.js
│   │   │   ├── TMDBGenresService.js
│   │   │   ├── TMDBAccountService.js
│   │   │   └── TMDBListsService.js
│   │   └── helpers/
│   │       └── ApiTestHelpers.js      # Validation helpers
│   ├── helpers/
│   │   └── TestDataProvider.js        # Test data constants
│   └── constants/
│       └── TMDBConstants.js           # HTTP & TMDB status codes
├── scripts/
│   ├── generateSessionId.js           # Session ID generator
│   └── validateEnv.js                 # Environment validator
├── tests/
│   └── api/
│       └── tmdb.api.spec.js           # All 44 API tests
├── playwright.config.js
├── package.json
├── .env                                # Your credentials (DON'T COMMIT!)
├── .env.example                        # Template
└── README.md
```

## 🔑 Authentication Setup

### For Read Operations (TC01-TC24)
- **Auth Method:** Bearer token
- **Setup:** Get API Read Access Token from TMDB
- **Scope:** Read-only operations

### For Write Operations (TC25-TC44)
- **Auth Method:** Bearer token + Session ID
- **Setup:** Run `node scripts/generateSessionId.js`
- **Scope:** Create, update, delete operations
- **One-time:** Session ID works until expiration

## 🎯 Key Features

✅ **Professional Architecture** - Service layer pattern with base client
✅ **Zero Hardcoding** - All configurations in .env
✅ **Performance Tracking** - Response time monitoring on all requests
✅ **Environment Validation** - Validates config before running tests
✅ **Automated Authentication** - Session ID generation script
✅ **Comprehensive Testing** - 44 tests covering all major endpoints
✅ **Error Handling** - Detailed error messages with context
✅ **HTTP Status Constants** - Named constants instead of magic numbers
✅ **Best Practices** - OOP principles, DRY, separation of concerns

## 📝 Test Examples

### API Test with Performance Tracking
```javascript
test('TC01 - Should retrieve movie details', async () => {
    const response = await moviesService.getMovieDetails(movieId);
    
    // Status validation
    expect(response.status).toBe(TMDBConstants.HTTP_STATUS.OK);
    
    // Performance assertion
    expect(response.duration).toBeLessThan(2000);
    
    // Data validation
    ApiTestHelpers.validateMovieStructure(response.data);
    expect(response.data.title).toBeTruthy();
});
```

### Write Operation Test
```javascript
test('TC25 - Should add movie to favorites', async () => {
    const response = await accountService.addToFavorites(
        accountId, 
        movieId, 
        true
    );
    
    expect([200, 201]).toContain(response.status);
    expect([1, 12]).toContain(response.data.status_code);
});
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# TMDB API
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_READ_ACCESS_TOKEN=your_token_here
TMDB_SESSION_ID=your_session_id_here
```

### Get TMDB Credentials
1. Sign up at https://www.themoviedb.org/
2. Go to Settings → API
3. Copy your API Key and Read Access Token
4. Run `node scripts/generateSessionId.js` for session ID

## 📊 Reports

### HTML Report (Auto-opens after tests)
```bash
npm run report
```

### Allure Report
```bash
npm run allure:generate
npm run allure:open
```

## 🎓 Design Patterns

- **Service Layer Pattern** - Abstracts API endpoints
- **Base Class Pattern** - Common HTTP operations
- **Helper/Utility Pattern** - Reusable validation logic
- **Data Provider Pattern** - Centralized test data
- **Constants Pattern** - Named status codes

## ✅ Best Practices Implemented

✅ Environment validation before tests
✅ Performance tracking on all requests  
✅ Named constants (no magic numbers)
✅ Detailed error messages with timing
✅ Proper separation of concerns
✅ Comprehensive documentation
✅ Security (no credentials in code)
✅ DRY principle throughout

## 🧪 Test Execution

```bash
# All tests
npm test

# Validate environment first
npm run validate:env && npm test

# Specific test cases
npx playwright test --grep "TC01"
npx playwright test --grep "TC43|TC44"

# Debug mode
npm run test:debug
```

## 📧 Support

- Check inline code comments
- Review test case descriptions
- Examine helper classes for validation examples
- Check SETUP.md for detailed setup instructions

---

**Framework Version:** 1.0.0  
**Author:** Andrii  
**Purpose:** TMDB API Test Automation Framework  
**Tests:** 44 API tests covering all major endpoints  
**Date:** January 2026
