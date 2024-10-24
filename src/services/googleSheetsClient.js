const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

// Load Google Sheets credentials
const sheets = google.sheets('v4');
const credentials = require(path.join(__dirname, '../config/googleSheetsCredentials.json')); // Adjusted for file path

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetsClient = async () => {
  return await auth.getClient();
};

// Function to update a row in Google Sheets
const updateGoogleSheet = async (sheetName, rowNum, rowData) => {
  try {
    const client = await sheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID; // Ensure this is set in your .env file

    const request = {
      auth: client,
      spreadsheetId,
      range: `${sheetName}!A${rowNum + 1}:Z${rowNum + 1}`, // The row to update
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData],
      },
    };

    const response = await sheets.spreadsheets.values.update(request);
    console.log('Google Sheet updated:', response.data);
  } catch (err) {
    console.error('Error updating Google Sheet:', err);
  }
};

module.exports = { updateGoogleSheet };
