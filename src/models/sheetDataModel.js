const pool = require('../config/database');

// Helper function to execute queries and log errors
const executeQuery = async (query, values = []) => {
  try {
    return await pool.query(query, values);
  } catch (err) {
    console.error('Error executing query:', err.message);
    throw err;
  }
};

// Check if a trigger exists in PostgreSQL
const doesTriggerExist = async (triggerName, tableName) => {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM pg_trigger 
      WHERE tgname = $1 
      AND tgrelid = (SELECT oid FROM pg_class WHERE relname = $2)
    );
  `;
  const result = await executeQuery(query, [triggerName, tableName]);
  return result.rows[0].exists;
};

// Create table with a UNIQUE constraint on (sheet_name, row_num) and add the 'source' column
const createSheetTable = async () => {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS sheet_data (
        id SERIAL PRIMARY KEY,
        sheet_name VARCHAR(255),
        row_num INT,
        row_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(255), 
        UNIQUE (sheet_name, row_num)  -- Add unique constraint on sheet_name and row_num
      );
    `);
    console.log('Table created successfully.');

    // Check if the trigger already exists
    const triggerExists = await doesTriggerExist('notify_url_trigger', 'sheet_data');

    if (!triggerExists) {
      // Create a trigger function to notify on changes
      await executeQuery(`
        CREATE OR REPLACE FUNCTION notify_url()
        RETURNS TRIGGER AS $$
        DECLARE
          payload json;
        BEGIN
          IF TG_OP = 'DELETE' AND OLD.source IS DISTINCT FROM 'API Request' THEN
            -- Notify when a row is deleted and source is not 'API Request'
            payload := json_build_object(
              'action', 'DELETE',
              'id', OLD.id,
              'sheet_name', OLD.sheet_name,
              'row_num', OLD.row_num,
              'row_data', OLD.row_data,
              'timestamp', OLD.timestamp
            );
            PERFORM pg_notify('row_changed', payload::text);
          ELSIF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.source IS DISTINCT FROM 'API Request' THEN
            -- Notify on insert or update and source is not 'API Request'
            payload := json_build_object(
              'action', TG_OP,
              'id', NEW.id,
              'sheet_name', NEW.sheet_name,
              'row_num', NEW.row_num,
              'row_data', NEW.row_data,
              'timestamp', NEW.timestamp
            );
            PERFORM pg_notify('row_changed', payload::text);
          END IF;
          RETURN CASE
            WHEN TG_OP = 'DELETE' THEN OLD
            ELSE NEW
          END; 
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('Trigger function created successfully.');

      // Create a trigger to call the notify_url function on insert, update, or delete
      await executeQuery(`
        CREATE TRIGGER notify_url_trigger
        AFTER INSERT OR UPDATE OR DELETE ON sheet_data
        FOR EACH ROW
        EXECUTE FUNCTION notify_url();
      `);
      console.log('Trigger created successfully.');
    } else {
      console.log('Trigger already exists, skipping creation.');
    }
  } catch (err) {
    console.error('Error creating table or trigger:', err.message);
    throw err;
  }
};

// Insert or update row based on sheet_name and row_num (ignoring column_num)
const insertOrUpdateRow = async ({ sheetName, row, rowData }) => {
  try {
    await executeQuery(`
      INSERT INTO sheet_data (sheet_name, row_num, row_data, source)
      VALUES ($1, $2, $3, 'API Request')  -- Set source to 'API Request'
      ON CONFLICT (sheet_name, row_num)
      DO UPDATE SET 
        row_data = EXCLUDED.row_data,  -- Update with the new row data
        timestamp = CURRENT_TIMESTAMP,
        source = 'API Request';  -- Update the source to 'API Request' on conflict
    `, [sheetName, row, JSON.stringify(rowData)]);

    console.log('Row inserted or updated successfully.');
  } catch (err) {
    console.error('Error inserting or updating row:', err.message);
    throw err;
  }
};

// Function to delete a row based on sheet_name and row_num
const deleteRowFromDB = async ({ sheetName, row }) => {
  try {
    const result = await executeQuery(`
      DELETE FROM sheet_data
      WHERE sheet_name = $1 AND row_num = $2
    `, [sheetName, row]);

    if (result.rowCount === 0) {
      console.log('No row found to delete.');
    } else {
      console.log('Row deleted successfully:', result.rowCount);
    }
  } catch (err) {
    console.error('Error deleting row from DB:', err.message);
    throw err;
  }
};

// Function to update a specific cell in a row to NULL
const updateCellInRow = async ({ sheetName, row, column }) => {
  try {
    // Fetch the row_data to modify only the necessary column
    const result = await executeQuery(`
      SELECT row_data
      FROM sheet_data
      WHERE sheet_name = $1 AND row_num = $2
    `, [sheetName, row]);

    if (result.rowCount === 0) {
      console.log('No row found to update.');
      return;
    }

    const rowData = result.rows[0].row_data;
    rowData[column - 1] = ""; // Set the specific column to NULL

    // Update the row with the modified row_data
    await executeQuery(`
      UPDATE sheet_data
      SET row_data = $1, timestamp = CURRENT_TIMESTAMP, source = 'API Request'  -- Set source to 'API Request'
      WHERE sheet_name = $2 AND row_num = $3
    `, [JSON.stringify(rowData), sheetName, row]);

    console.log('Cell updated to NULL successfully.');
  } catch (err) {
    console.error('Error updating cell in row:', err.message);
    throw err;
  }
};

module.exports = { createSheetTable, insertOrUpdateRow, deleteRowFromDB, updateCellInRow };
