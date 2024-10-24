const { insertOrUpdateRow, deleteRowFromDB, updateCellInRow  } = require('../models/sheetDataModel');
const { validateGoogleSheetData } = require('../utils/validateData');

const processGoogleSheetUpdate = async (data) => {
  // Validate incoming data
  const { valid, message } = validateGoogleSheetData(data);
  if (!valid) throw new Error(message);

  // Insert data into PostgreSQL
  await insertOrUpdateRow({
    sheetName: data.sheetName,
    row: data.row,
    column: data.column,
    rowData: data.rowData,
  });
};

const handleGoogleSheetData = async ({ sheetName, row, column, rowData }) => {
  try {
    const isRowEmpty = rowData.every(cell => !cell); // Check if all cells in the row are empty

    if (isRowEmpty) {
      // If all cells are empty, delete the entire row
      await deleteRowFromDB({ sheetName, row });
    } else {
      // Otherwise, update the specific column to NULL
      if (!rowData[column - 1]) {  // If the column is empty
        await updateCellInRow({ sheetName, row, column });
      }
    }
  } catch (err) {
    console.error('Error in handleGoogleSheetData service:', err);
    throw err;
  }
};



module.exports = { processGoogleSheetUpdate, handleGoogleSheetData };
