const mongoose = require('mongoose');
const { Schema } = mongoose;

const userPreferenceSchema = new Schema({
  // ID of the user
  user_id: {
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true 
  },

  preferred_category: [{
    type: Schema.Types.ObjectId, 
    ref: 'EventCategory'
  }],
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
