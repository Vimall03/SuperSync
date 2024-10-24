const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const sheetRoutes = require('./routes/googleSheetsRoutes');
const { createSheetTable } = require('./models/sheetDataModel');
const { listenForNotifications } = require('./utils/dbNotificationListener'); // Import the listener
const errorHandler = require('./middlewares/errorHandler');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

// Routes
app.use('/api/sheets', sheetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the app
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await createSheetTable(); // Ensure the table exists
  listenForNotifications(); // Start listening to notifications
});
