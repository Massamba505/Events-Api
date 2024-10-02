const mongoose = require("mongoose");

const eventCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true
  },
  image:{
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('EventCategory', eventCategorySchema);