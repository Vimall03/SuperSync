const express = require('express');
const { getAllData, updateProduct } = require('../controllers/dashboardController');

const router = express.Router();

// Route to fetch all products data
router.get('/products', getAllData);

// Route to update a product by ID
router.put('/products/:id', updateProduct);

module.exports = router;
