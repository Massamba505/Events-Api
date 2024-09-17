const eventCategorySchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('EventCategory', eventCategorySchema);
