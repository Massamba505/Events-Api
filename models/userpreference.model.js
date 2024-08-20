const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the UserPreference collection
const userPreferenceSchema = new Schema({
  // ID of the user
  user_id: { 
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true 
  },

  preferred_category: [{ 
    type:String
    // type: Schema.Types.ObjectId, 
    // ref: 'EventCategory'
  }],
});

// Export the UserPreference model
module.exports = mongoose.model('UserPreference', userPreferenceSchema);
