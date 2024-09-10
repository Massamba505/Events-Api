const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventCategorySchema = new Schema({
  name: { type: String, required: true }
});
module.exports = mongoose.model('EventCategory', eventCategorySchema);