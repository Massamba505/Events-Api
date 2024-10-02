const Ticket = require('../models/ticket.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Event = require("../models/event.model");

const buyTicket = async (req, res) => {
  const { eventId, userId = req.user._id, ticketType, price, eventDate, attendeeInfo } = req.body;

  try {
    let paymentIntent = null;
    if (ticketType !== 'RSVP') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: 'usd',
        payment_method_types: ['card'],
      });
    }

    const event = await Event.findOne({ event_id: eventId });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const ticket = new Ticket({
      event_id: event._id,
      user_id: userId,
      ticket_type: ticketType,
      price: ticketType === 'RSVP' ? 0 : price, // No price for RSVP
      stripe_payment_intent_id: paymentIntent ? paymentIntent.id : null,
      attendee_info: attendeeInfo,
      event_date: eventDate,
      payment_status: ticketType === 'RSVP' ? 'Paid' : 'Pending',
    });

    await ticket.save();

    if (ticketType === 'RSVP') {
      const qrCodeData = `Ticket ID: ${ticket._id}, Event ID: ${event._id}`;
      const qrCode = await QRCode.toDataURL(qrCodeData);

      ticket.qr_code = qrCode;
      await ticket.save();

      return res.status(200).json({
        success: true,
        message: "RSVP successful",
        ticket,
      });
    }

    return res.status(200).json({
      success: true,
      ticketId: ticket._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(500).json({ error: 'Failed to process ticket purchase' });
  }
};

const confirmPayment = async (req, res) => {
  const { ticketId, paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const ticket = await Ticket.findById(ticketId);

      const qrCodeData = `Ticket ID: ${ticketId}, Event ID: ${ticket.event_id}`;
      const qrCode = await QRCode.toDataURL(qrCodeData);

      ticket.payment_status = 'Paid';
      ticket.qr_code = qrCode;
      await ticket.save();

      res.status(200).json({
        message: 'Payment confirmed and QR code generated',
        ticket,
      });
    } else {
      res.status(400).json({ error: 'Payment was not successful' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

const scanTicket = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id; // Organizer

  try {
    const ticket = await Ticket.findById(ticketId).populate('event_id');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const event = await Event.findById(ticket.event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized - Only event organizer can scan tickets' });
    }

    if (ticket.used) {
      return res.status(400).json({ error: 'Ticket has already been used' });
    }

    ticket.used = new Date();
    await ticket.save();

    res.status(200).json({ message: 'Ticket scanned successfully', ticket });
  } catch (error) {
    console.error('Error scanning ticket:', error);
    res.status(500).json({ error: 'Failed to scan ticket' });
  }
};

const cancelTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.payment_status = 'Cancelled';
    await ticket.save();

    res.status(200).json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
};

const requestRefund = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.payment_status !== 'Paid') {
      return res.status(400).json({ error: 'Refund can only be requested for paid tickets' });
    }

    ticket.refund_status = 'Requested';
    await ticket.save();

    res.status(200).json({ message: 'Refund request submitted' });
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({ error: 'Failed to request refund' });
  }
};

const getTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findById(ticketId).populate('event_id user_id');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

const getAllTickets = async (req, res) => {
  const { userId } = req.params;

  try {
    const tickets = await Ticket.find({ user_id: userId }).populate('event_id');
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

module.exports = {
  buyTicket,
  confirmPayment,
  scanTicket,
  cancelTicket,
  requestRefund,
  getTicket,
  getAllTickets
};
