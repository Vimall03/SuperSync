const express = require('express');
const { receiveGoogleSheetData, deleteGoogleSheetData } = require('../controllers/googleSheetsController');

const router = express.Router();

router.post('/data', receiveGoogleSheetData);
router.post('/deletedata', deleteGoogleSheetData);


module.exports = router;
