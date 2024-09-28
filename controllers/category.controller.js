const Category = require('../models/eventCategory.model');
const { uploadImage } = require("../utils/azureBlob");
const path = require('path');
const fs = require('fs');


// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new category
const addCategory = async (req, res) => {
    const { name } = req.body;
    const imageFile = req.file; // Handle single image upload
  
    try {
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
      }
      
      // Validate image upload
      if (!imageFile) {
        return res.status(400).json({ error: 'An image file is required.' });
      }
  
      // Define image upload path
      const imagePath = path.join(__dirname, '..', 'uploads', imageFile.filename);
  
      // Upload image and get its URL
      const imageUrl = await uploadImage(imagePath);
  
      // Clean up temporary file asynchronously
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${imagePath}`, err);
        }
      });
  
      // Create a new category
      const newCategory = new Category({ name, image: imageUrl });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ error: 'Failed to add category' });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const imageFile = req.file; // Handle image upload (can be null)
  
    try {
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
      }
  
      let imageUrl = null; // Default to null if no new image is provided
      if (imageFile) {
        const imagePath = path.join(__dirname, '..', 'uploads', imageFile.filename); // Path where multer temporarily stores images
  
        // Upload image and get its URL
        imageUrl = await uploadImage(imagePath);
  
        // Clean up temporary file asynchronously
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${imagePath}`, err);
          }
        });
      }
  
      // Update category with new name and optionally new image
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { 
          name, 
          image: imageUrl !== null ? imageUrl : undefined // Update image only if there is a new one
        },
        { new: true }
      );
  
      if (!updatedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
