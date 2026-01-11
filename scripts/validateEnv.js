/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set before running tests.
 * Run this before test execution to catch configuration issues early.
 * 
 * Usage: node scripts/validateEnv.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

/**
 * Required environment variables for API tests
 */
const REQUIRED_ENV_VARS = {
    // TMDB API Configuration
    TMDB_API_KEY: {
        description: 'TMDB API Key',
        example: 'your_api_key_here',
        required: true
    },
    TMDB_BASE_URL: {
        description: 'TMDB API Base URL',
        example: 'https://api.themoviedb.org/3',
        required: true
    },
    TMDB_READ_ACCESS_TOKEN: {
        description: 'TMDB Read Access Token',
        example: 'eyJhbGci...',
        required: true
    },
    TMDB_SESSION_ID: {
        description: 'TMDB Session ID (for write operations)',
        example: 'generated_session_id',
        required: false // Optional - only needed for TC25-TC44
    }
};

/**
 * Validate environment variables
 */
function validateEnvironment() {
    log('\n🔍 Validating Environment Configuration...', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Load .env file
    require('dotenv').config();
    
    let hasErrors = false;
    let hasWarnings = false;
    const missing = [];
    const invalid = [];
    const optional = [];
    
    // Check each required variable
    for (const [varName, config] of Object.entries(REQUIRED_ENV_VARS)) {
        const value = process.env[varName];
        
        if (!value || value === config.example) {
            if (config.required) {
                missing.push({ varName, config });
                hasErrors = true;
            } else {
                optional.push({ varName, config });
                hasWarnings = true;
            }
        } else {
            // Validate URL format for URL variables
            if (varName.includes('URL')) {
                try {
                    new URL(value);
                    log(`✅ ${varName}: Valid`, 'green');
                } catch (e) {
                    invalid.push({ varName, config, value });
                    hasErrors = true;
                }
            } else {
                log(`✅ ${varName}: Set`, 'green');
            }
        }
    }
    
    // Report missing required variables
    if (missing.length > 0) {
        log('\n❌ Missing Required Variables:', 'red');
        missing.forEach(({ varName, config }) => {
            log(`   - ${varName}`, 'red');
            log(`     Description: ${config.description}`, 'reset');
            log(`     Example: ${config.example}`, 'yellow');
        });
    }
    
    // Report invalid variables
    if (invalid.length > 0) {
        log('\n❌ Invalid Variables:', 'red');
        invalid.forEach(({ varName, config }) => {
            log(`   - ${varName}: Invalid format`, 'red');
            log(`     Expected: ${config.description}`, 'reset');
        });
    }
    
    // Report missing optional variables
    if (optional.length > 0) {
        log('\n⚠️  Missing Optional Variables:', 'yellow');
        optional.forEach(({ varName, config }) => {
            log(`   - ${varName}`, 'yellow');
            log(`     Description: ${config.description}`, 'reset');
            log(`     Note: Only needed for write operations (TC25-TC44)`, 'reset');
        });
    }
    
    // Check if .env file exists
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        log('\n⚠️  .env file not found!', 'yellow');
        log('   Run: cp .env.example .env', 'reset');
        log('   Then edit .env with your credentials', 'reset');
        hasErrors = true;
    }
    
    // Final summary
    log('\n' + '='.repeat(50), 'cyan');
    
    if (!hasErrors && !hasWarnings) {
        log('✅ All required environment variables are properly configured!', 'green');
        log('\n🚀 You can now run tests:', 'cyan');
        log('   npm test', 'bold');
        return true;
    } else if (!hasErrors && hasWarnings) {
        log('⚠️  Environment is valid but missing optional variables', 'yellow');
        log('\n📝 Notes:', 'cyan');
        log('   - TMDB_SESSION_ID is only needed for write operations (TC25-TC44)', 'reset');
        log('   - To generate session ID: node scripts/generateSessionId.js', 'reset');
        log('\n🚀 You can run read-only tests (TC01-TC24):', 'cyan');
        log('   npx playwright test --grep "TC0[1-9]|TC1[0-9]|TC2[0-4]"', 'bold');
        return true;
    } else {
        log('❌ Environment validation failed!', 'red');
        log('\n📝 Fix the issues above, then try again.', 'reset');
        return false;
    }
}

// Run validation
const isValid = validateEnvironment();

// Exit with error code if validation failed
process.exit(isValid ? 0 : 1);
