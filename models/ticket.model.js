const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  event_id: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registration_type: {
    type: String,
    enum: ['RSVP', 'General Admission', 'VIP', 'Early Bird'],
    required: true
  },
  ticket_number: {
    type: String,
    unique: true,
    sparse: true
  },
  issue_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['issued', 'used', 'cancelled'],
    default: 'issued'
  },
  price: {
    type: Schema.Types.Decimal128,
    default: null
  },
  qr_code: {
    type: String,
    default: null
  },
  event_date: {
    type: Date,
    default: null
  },
  refund_status: {
    type: String,
    enum: ['not requested', 'pending', 'approved', 'rejected'],
    default: 'not requested'
  },
  expiration_date: {
    type: Date,
  },
  registration_time: {
    type: Date,
    default: Date.now
  }
});

// Export the combined Ticket model
module.exports = mongoose.model('Ticket', ticketSchema);
