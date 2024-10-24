const { processGoogleSheetUpdate, handleGoogleSheetData } = require('../services/googleSheetsService');

const receiveGoogleSheetData = async (req, res, next) => {
  try {
    const googleSheetData = req.body;
    await processGoogleSheetUpdate(googleSheetData);
    res.status(200).json({ message: 'Data successfully updated.' });
  } catch (err) {
    next(err);
  }
};

const deleteGoogleSheetData = async (req, res) => {
  try {
    const { sheetName, row, column, rowData } = req.body;

    if (!sheetName || row === undefined || column === undefined) {
      return res.status(400).json({ error: 'sheetName, row, and column must be provided' });
    }

    // Call the service to process the deletion or cell update
    await handleGoogleSheetData({ sheetName, row, column, rowData });

    return res.status(200).json({ message: 'Row or cell updated/deleted successfully' });
  } catch (err) {
    console.error('Error handling row or cell update:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = { receiveGoogleSheetData, deleteGoogleSheetData };
