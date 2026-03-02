// getOAuthTokens.js
const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env file');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
});

console.log('Authorize this app by visiting this URL:', authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
    oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
            console.error('Error getting tokens:', err);
            return;
        }

        console.log('\n✅ Tokens received!');
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('Access Token:', tokens.access_token);

        // Save these to your .env file
        console.log('\n📋 Add to your .env file:');
        console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID);
        console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET);
        console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);

        rl.close();
    });
});