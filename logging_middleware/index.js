require('dotenv').config();
const axios = require('axios');

const TEST_SERVER_BASE_URL = 'http://20.207.122.201/evaluation-service';
let cachedToken = null;
let tokenExpiryTime = null;

/**
 * Authenticates with the Test Server to obtain the Bearer token.
 * Uses CLIENT_ID and CLIENT_SECRET from environment variables.
 * Caches the token for future calls until it expires.
 */
async function getAuthToken() {
    // If token exists and is not expired (buffer of 1 min), return it
    if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
        return cachedToken;
    }

    try {
        const response = await axios.post(`${TEST_SERVER_BASE_URL}/auth`, {
            email: process.env.EMAIL,
            name: process.env.NAME,
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });

        const data = response.data;
        cachedToken = data.access_token;
        // expires_in is usually in seconds
        tokenExpiryTime = Date.now() + (data.expires_in * 1000);
        return cachedToken;
    } catch (error) {
        console.error("Critical: Failed to obtain Auth Token from Test Server", error?.response?.data || error.message);
        return null;
    }
}

/**
 * Reusable Logging function.
 * @param {string} stack "backend" or "frontend"
 * @param {string} level "debug", "info", "warn", "error", "fatal"
 * @param {string} package "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service", "auth", "config", "middleware", "utils"
 * @param {string} message Specific log message
 */
async function Log(stack, level, pkg, message) {
    try {
        const token = await getAuthToken();
        if (!token) {
            console.error("Log aborted due to missing Auth Token.");
            return;
        }

        const payload = {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: pkg.toLowerCase(),
            message: message.substring(0, 48)
        };

        await axios.post(`${TEST_SERVER_BASE_URL}/logs`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Also log to console for local debugging
        console.log(`[${level.toUpperCase()}] [${pkg}] ${message}`);
    } catch (error) {
        // Fallback to console error if the remote log fails
        console.error("Failed to send log to Test Server:", error?.response?.data || error.message);
    }
}

module.exports = { Log, getAuthToken };
