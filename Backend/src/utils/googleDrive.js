// src/utils/googleDriveOAuth.js
const { google } = require('googleapis');
require('dotenv').config();

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.error('Missing OAuth credentials in .env file');
    console.log('Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
}

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
);

// Set credentials
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Initialize Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Uploads a file to Google Drive using OAuth 2.0
 */
const uploadToDrive = async (fileBuffer, filename, mimeType) => {
    try {
        console.log('📤 Uploading file to Google Drive via OAuth...');
        console.log('File:', filename, 'Size:', fileBuffer.length, 'bytes');

        // Ensure we have a valid folder ID
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set in .env');
        }

        // Create file metadata
        const fileMetadata = {
            name: `${Date.now()}_${filename}`,
            parents: [folderId]
        };

        // Create media
        const media = {
            mimeType: mimeType,
            body: require('stream').Readable.from(fileBuffer)
        };

        console.log('Target folder ID:', folderId);

        // Upload file
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        });

        console.log('✅ File uploaded successfully!');
        console.log('File ID:', response.data.id);
        console.log('File Name:', response.data.name);

        // Set public permissions
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            fields: 'id',
        });

        console.log('✅ Public permissions set');

        // Return direct download link for audio files to ensure playback
        if (mimeType.startsWith('audio/')) {
            // Use constructed URL for max reliability with <audio> tags
            return `https://drive.google.com/uc?export=download&id=${response.data.id}`;
        }

        return response.data.webViewLink || response.data.webContentLink;

    } catch (error) {
        console.error('❌ OAuth Drive Upload Error:');

        // Detailed error logging
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));

            // Handle token expiration
            if (error.response.status === 401) {
                console.error('Token may be expired. Try refreshing or regenerating tokens.');
            }
        } else {
            console.error('Message:', error.message);
        }

        throw new Error(`Google Drive Upload Failed: ${error.message}`);
    }
};

/**
 * Test the connection to Google Drive
 */
const testDriveConnection = async () => {
    try {
        console.log('🔍 Testing Google Drive connection...');

        // Get authenticated user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        console.log('✅ Authenticated as:', userInfo.data.email);

        // Test folder access
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (folderId) {
            const folder = await drive.files.get({
                fileId: folderId,
                fields: 'id, name, mimeType',
            });
            console.log('✅ Folder access verified:', folder.data.name);
        }

        console.log('✅ Google Drive connection successful!');
        return true;

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        return false;
    }
};

/**
 * Get a file stream from Google Drive
 */
const getFileStream = async (fileId) => {
    try {
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Error getting file stream:', error.message);
        throw error;
    }
};

const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0 sec";

  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];

  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} min`);
  if (seconds) parts.push(`${seconds} sec`);

  return parts.join(", ");
};

module.exports = { uploadToDrive, testDriveConnection, getFileStream ,formatDuration};