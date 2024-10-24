const pool = require('../config/database');
const { updateGoogleSheet } = require('../services/googleSheetsClient');

const listenForNotifications = async () => {
  const client = await pool.connect();
  try {
    // Listen for row changes on the 'row_changed' channel
    await client.query('LISTEN row_changed');
    console.log('Listening for database changes...');

    client.on('notification', async (msg) => {
      try {
        const data = JSON.parse(msg.payload);
        console.log('Notification received:', data);

        if (data.action === 'DELETE') {
          console.log(`Row deleted: Row number ${data.row_num}`);
          
          // Clear the corresponding row in Google Sheets
          await updateGoogleSheet(data.sheet_name, data.row_num, []);
        } else {
          console.log('Row change details:', data);

          // Send updated row data to Google Sheets
          await updateGoogleSheet(data.sheet_name, data.row_num, data.row_data);
        }
      } catch (err) {
        console.error('Error processing notification:', err);
      }
    });
  } catch (err) {
    console.error('Error listening for notifications:', err);
  } finally {
    
  }
};

module.exports = { listenForNotifications };
