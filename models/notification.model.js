const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

  event_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event'
  },

  message: { 
    type: String, 
    required: true 
  },

  sent_at: { 
    type: Date, 
    default: Date.now 
  },

  is_read: { 
    type: Boolean,
    default: false
  }
});


module.exports = mongoose.model('Notification', notificationSchema);
