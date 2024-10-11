const mongoose = require('mongoose');
const { Schema } = mongoose;

const venueSchema = new Schema({
  name: { 
    type: String, 
    unique:true,
    required: true 
  },

  location: { 
    type: [Number], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2;
      },
      message: 'Location must have exactly two values: [longitude, latitude]'
    }
  },

  status: { 
    type: Boolean,
    default:true
  },

  capacity: { 
    type: Number
  },

}, { timestamps: true });

module.exports = mongoose.model('venue', venueSchema);
