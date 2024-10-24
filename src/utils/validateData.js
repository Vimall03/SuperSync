const validateGoogleSheetData = (data) => {
  if (!data.sheetName || typeof data.sheetName !== 'string') {
    return { valid: false, message: 'Invalid sheet name.' };
  }
  if (!data.row || !data.column || !Array.isArray(data.rowData)) {
    return { valid: false, message: 'Invalid row or column data.' };
  }
  return { valid: true };
};

module.exports = { validateGoogleSheetData };
