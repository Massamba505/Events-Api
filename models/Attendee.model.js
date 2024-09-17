const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendeeSchema = new Schema({
    event_id: { 
      type: Schema.Types.ObjectId, 
      ref: 'Event', 
      required: true 
    },
    user_id: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Attendee', attendeeSchema);
  