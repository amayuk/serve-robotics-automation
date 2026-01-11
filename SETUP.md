# Quick Setup Guide - TMDB API Testing Framework

Get started in 5 minutes.

## Step 1: Prerequisites

Ensure you have Node.js v18+ installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

## Step 2: Install Dependencies

```bash
# Clone repository
git clone <repo-url>
cd serve-robotics-automation

# Install packages
npm install

# Install Chromium browser
npx playwright install chromium
```

## Step 3: Configure TMDB API

### 3.1: Get API Credentials

1. Go to https://www.themoviedb.org/
2. Sign up (free)
3. Go to Settings → API
4. Copy your **API Key** and **Read Access Token**

### 3.2: Update .env File

```bash
# Copy template
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
TMDB_API_KEY=your_api_key_here
TMDB_READ_ACCESS_TOKEN=your_token_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 3.3: Validate Environment

```bash
npm run validate:env
```

Expected output:
```
🔍 Validating Environment Configuration...
✅ TMDB_API_KEY: Set
✅ TMDB_BASE_URL: Valid
✅ TMDB_READ_ACCESS_TOKEN: Set
✅ All required environment variables are properly configured!
```

### 3.4: Generate Session ID (One-Time)

For write operations (TC25-TC44):
```bash
node scripts/generateSessionId.js
```

Enter your TMDB username and password when prompted.
Session ID will be saved to `.env` automatically.

## Step 4: Run Tests

```bash
# All tests (44 API tests)
npm test

# With browser visible
npm run test:headed

# Specific test
npx playwright test --grep "TC01"
```

## Step 5: View Reports

After tests complete, HTML report opens automatically.

To manually open:
```bash
npm run report
```

## Expected Results

- **Total Tests:** 44 API tests
- **Coverage:** Movies, Search, Genres, Account, Favorites, Watchlist, Lists
- **Execution Time:** ~3-5 minutes
- **Success Rate:** 100%

## Test Breakdown

**Read Operations (TC01-TC24):**
- No session ID required
- Uses Bearer token only

**Write Operations (TC25-TC44):**
- Requires session ID
- Generated in Step 3.4

## Troubleshooting

### Tests Failing?

**Check credentials:**
```bash
cat .env
```

**Validate environment:**
```bash
npm run validate:env
```

**Clear cache:**
```bash
rm -rf test-results playwright-report
npm test
```

**Debug mode:**
```bash
npm run test:debug
```

### Common Issues

**"Cannot find module"**  
Solution: `npm install`

**"API Key invalid"**  
Solution: Verify `.env` has correct `TMDB_API_KEY` (no spaces)

**"Browser not found"**  
Solution: `npx playwright install chromium`

**"Authentication failed" (TC25-TC44)**  
Solution: Run `node scripts/generateSessionId.js` again

**"TMDB_SESSION_ID not found"**  
Solution: Run `node scripts/generateSessionId.js`

## File Structure

```
serve-robotics-automation/
├── .env                    # Your credentials (DON'T COMMIT!)
├── .env.example           # Template
├── playwright.config.js   # Test configuration
├── package.json          # Dependencies
├── scripts/
│   ├── generateSessionId.js  # Session generator
│   └── validateEnv.js        # Environment validator
├── tests/
│   └── api/              # 44 API tests
└── src/
    ├── api/services/     # API service classes
    ├── api/helpers/      # Validation helpers
    ├── helpers/          # Test data
    └── constants/        # Status codes
```

## Quick Commands

```bash
# Validate environment
npm run validate:env

# Run all tests
npm test

# Run specific test
npx playwright test -g "TC01"

# Run multiple tests
npx playwright test -g "TC43|TC44"

# Debug mode
npm run test:debug

# View report
npm run report
```

## Verification Checklist

Before running tests:
- [ ] Dependencies installed (`npm install`)
- [ ] Chromium installed (`npx playwright install chromium`)
- [ ] `.env` file created
- [ ] TMDB credentials added to `.env`
- [ ] Environment validated (`npm run validate:env`)
- [ ] Session ID generated (for TC25-TC44)

---

**Setup Time:** ~5 minutes  
**Ready to Run:** Just add TMDB credentials  
**Framework:** API Testing Only (44 tests)
