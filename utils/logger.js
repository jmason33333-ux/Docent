const { google } = require('googleapis');

let sheets = null;
let isConfigured = false;

/**
 * Initialize Google Sheets API
 * Expects GOOGLE_SHEETS_CREDENTIALS env var with service account JSON
 */
function initializeSheets() {
  try {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      console.warn('Google Sheets logging not configured - skipping');
      return false;
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheets = google.sheets({ version: 'v4', auth });
    isConfigured = true;
    console.log('Google Sheets logging initialized');
    return true;

  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
    return false;
  }
}

/**
 * Log a conversation to Google Sheets
 * @param {Object} data
 * @param {string} data.userId - Anonymous user ID (can be generated from session)
 * @param {string} data.book - Book title
 * @param {number} data.chapter - Chapter number
 * @param {string} data.question - User's question
 * @param {string} data.answer - Rowan's response
 */
async function logConversation({ userId, book, chapter, question, answer }) {
  const timestamp = new Date().toISOString();

  // Fallback: console logging if Sheets not configured
  if (!isConfigured) {
    console.log('CONVERSATION LOG:', JSON.stringify({
      timestamp,
      userId,
      book,
      chapter,
      question: question.substring(0, 100) + '...',
      answer: answer.substring(0, 100) + '...'
    }, null, 2));
    return;
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID not set - skipping Sheets logging');
      return;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Conversations!A:F',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          timestamp,
          userId,
          book,
          chapter,
          question,
          answer
        ]]
      }
    });

    console.log('Logged conversation to Google Sheets');

  } catch (error) {
    console.error('Failed to log to Google Sheets:', error.message);
    // Don't throw - logging failure shouldn't break the app
  }
}

module.exports = {
  initializeSheets,
  logConversation
};
