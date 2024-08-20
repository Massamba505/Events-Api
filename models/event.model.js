const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId,
    ref:"User",
    required: true 
  },

  title: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String, 
    required: true 
  },

  location: { 
    type: String, 
    required: true 
  },

  date: { 
    type: String, 
    required: true 
  },

  start_time: { 
    type: String, 
    required: true 
  },
  
  end_time: { 
    type: String, 
    required: true 
  },

  is_paid: { 
    type: Boolean, 
    required: true 
  },

  ticket_price: { 
    type: Number,
    default:0
  },

  max_attendees: { 
    type: Number,
  },

  current_attendees: { 
    type: Number, 
    default: 0 
  },

  images: [{
    type: String 
  }],

  isCancelled: {
    type: Boolean,
    default: false,
  },

  category: [{ 
    type:String
    // type: Schema.Types.ObjectId, 
    // ref: 'EventCategory' 
  }]
},{timestamps:true});

module.exports = mongoose.model('Event', eventSchema);
