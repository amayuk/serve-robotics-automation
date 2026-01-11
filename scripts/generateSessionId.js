/**
 * Generate TMDB Session ID
 * 
 * This script generates a session_id for TMDB API v3 write operations.
 * You only need to run this ONCE. The session_id can be reused until it expires.
 * 
 * Usage: node scripts/generateSessionId.js
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'api.themoviedb.org';

// Colors for console output
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

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', reject);
        
        if (postData) {
            req.write(JSON.stringify(postData));
        }
        
        req.end();
    });
}

async function generateSessionId() {
    try {
        log('\n🎬 TMDB Session ID Generator', 'cyan');
        log('=====================================\n', 'cyan');

        if (!API_KEY) {
            log('❌ Error: TMDB_API_KEY not found in .env file', 'red');
            process.exit(1);
        }

        // Step 1: Create request token
        log('📝 Step 1: Creating request token...', 'yellow');
        
        const tokenOptions = {
            hostname: BASE_URL,
            path: `/3/authentication/token/new?api_key=${API_KEY}`,
            method: 'GET'
        };

        const tokenResponse = await makeRequest(tokenOptions);
        
        if (!tokenResponse.success) {
            log('❌ Failed to create request token', 'red');
            console.log(tokenResponse);
            process.exit(1);
        }

        const requestToken = tokenResponse.request_token;
        log('✅ Request token created successfully!', 'green');

        // Step 2: Get username and password
        log('\n🔐 Step 2: Enter your TMDB credentials', 'yellow');
        log('(Your password is hidden for security)\n', 'yellow');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const username = await new Promise((resolve) => {
            rl.question('TMDB Username: ', resolve);
        });

        const password = await new Promise((resolve) => {
            process.stdout.write('TMDB Password: ');
            process.stdin.setRawMode(true);
            let pass = '';
            
            process.stdin.on('data', (char) => {
                char = char.toString('utf8');
                
                if (char === '\n' || char === '\r' || char === '\u0004') {
                    process.stdin.setRawMode(false);
                    process.stdout.write('\n');
                    resolve(pass);
                } else if (char === '\u0003') {
                    process.exit();
                } else if (char === '\u007f') {
                    pass = pass.slice(0, -1);
                    process.stdout.write('\b \b');
                } else {
                    pass += char;
                    process.stdout.write('*');
                }
            });
        });

        rl.close();

        // Step 3: Validate token with login
        log('\n🔓 Step 3: Validating credentials...', 'yellow');

        const validateOptions = {
            hostname: BASE_URL,
            path: `/3/authentication/token/validate_with_login?api_key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const validateData = {
            username: username.trim(),
            password: password,
            request_token: requestToken
        };

        const validateResponse = await makeRequest(validateOptions, validateData);

        if (!validateResponse.success) {
            log('❌ Authentication failed! Please check your credentials.', 'red');
            console.log(validateResponse);
            process.exit(1);
        }

        log('✅ Credentials validated successfully!', 'green');

        // Step 4: Create session
        log('\n🎫 Step 4: Creating session ID...', 'yellow');

        const sessionOptions = {
            hostname: BASE_URL,
            path: `/3/authentication/session/new?api_key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const sessionData = {
            request_token: requestToken
        };

        const sessionResponse = await makeRequest(sessionOptions, sessionData);

        if (!sessionResponse.success) {
            log('❌ Failed to create session', 'red');
            console.log(sessionResponse);
            process.exit(1);
        }

        const sessionId = sessionResponse.session_id;
        log('✅ Session ID created successfully!', 'green');

        // Step 5: Save to .env
        log('\n💾 Step 5: Saving to .env file...', 'yellow');

        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';

        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        // Check if TMDB_SESSION_ID already exists
        if (envContent.includes('TMDB_SESSION_ID=')) {
            // Replace existing value
            envContent = envContent.replace(
                /TMDB_SESSION_ID=.*/,
                `TMDB_SESSION_ID=${sessionId}`
            );
        } else {
            // Add new line
            envContent += `\nTMDB_SESSION_ID=${sessionId}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        log('✅ Session ID saved to .env file!', 'green');

        // Success summary
        log('\n' + '='.repeat(50), 'green');
        log('🎉 SUCCESS! Session ID Generated', 'green');
        log('='.repeat(50), 'green');
        log(`\n📋 Your session ID: ${sessionId}`, 'cyan');
        log('\n✅ This session ID has been saved to your .env file', 'green');
        log('✅ You can now run TC25-TC44 tests!', 'green');
        log('\n📌 Note: This session ID will work until it expires.', 'yellow');
        log('📌 If tests fail with auth errors later, re-run this script.', 'yellow');
        log('\n🚀 Run your tests now:', 'cyan');
        log('   npx playwright test --grep "TC44"', 'bold');
        log('   npx playwright test --grep "TC43|TC44"', 'bold');
        log('\n');

    } catch (error) {
        log('\n❌ Error: ' + error.message, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the script
generateSessionId();
