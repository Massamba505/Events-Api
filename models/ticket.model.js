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
  ticket_type: {
    type: String,
    enum: ['RSVP', 'General Admission', 'VIP', 'Early Bird'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stripe_payment_intent_id: {
    type: String,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  qr_code: {
    type: String, // URL or base64 string for the QR code
    default: null
  },
  event_date: {
    type: Date,
    required: true
  },
  refund_status: {
    type: String,
    enum: ['Not Requested', 'Requested', 'Refunded'],
    default: 'Not Requested'
  },
  used: {
    type: Date,
    default: null
  },
});

module.exports = mongoose.model('Ticket', ticketSchema);
