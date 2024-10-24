function onEditt(e) {
  if (!e) {
    Logger.log("No event object available. Ensure you're testing by editing the sheet, not running the script manually.");
    return;
  }

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  const range = e.range;
  const rowData = sheet.getRange(range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0]; // Get row data for the edited range
  const entireSheetData = sheet.getDataRange().getValues();
  const editedCells = range.getValues();

  // Check if the range is empty (indicating deletion)
  const isDeleted = editedCells.every(row => row.every(cell => cell === ""));

  // Construct the payload
  const payload = {
    timestamp: new Date(),
    sheetName: sheetName,
    row: range.getRow(),
    column: range.getColumn(),
    rowData: rowData, // Data of the row that was edited or deleted
    entireSheetData: entireSheetData // Data of the entire sheet
  };

  Logger.log("Payload: " + JSON.stringify(payload));

  // Determine the correct endpoint URL
  const url = isDeleted
    ? 'https://ccf1-182-72-39-9.ngrok-free.app/api/sheets/deletedata'
    : 'https://ccf1-182-72-39-9.ngrok-free.app/api/sheets/data';

  // Send the request
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log("Error sending data: " + error.message);
  }
}
