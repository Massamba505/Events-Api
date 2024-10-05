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
    enum: ['Paid','RSVP', 'General Admission', 'VIP', 'Early Bird'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  event_date: {
    type: Date,
    required: true
  },
  stripe_payment_intent_id: {
    type: String,
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
  refund_status: {
    type: String,
    enum: ['Not Requested', 'Requested', 'Refunded'],
    default: 'Not Requested'
  },
  used: {
    type: Date,
    default: null
  },
},{timestamps:true});

module.exports = mongoose.model('Ticket', ticketSchema);
