const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

const upload = require('../utils/multerConfig'); // Configure multer for file uploads

const { authenticate } = require('../middlewares/protect.middleware');

// Get all categories
router.get('/',authenticate, getAllCategories);

// Add a new category
router.post('/',authenticate, upload.single('image'), addCategory);

// Update a category
router.put('/:id',authenticate, upload.single('image'), updateCategory);

// Delete a category
router.delete('/:id',authenticate, deleteCategory);

module.exports = router;
