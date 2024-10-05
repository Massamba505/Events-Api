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

  isRead: { 
    type: Boolean,
    default: false
  }
},{ timestamps: true });


module.exports = mongoose.model('Notification', notificationSchema);
