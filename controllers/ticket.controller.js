const Ticket = require('../models/ticket.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QRCode = require('qrcode');
const Event = require("../models/event.model");

const buyTicket = async (req, res) => {
  const { eventId, userId = req.user._id, ticketType, price, eventDate, attendeeInfo } = req.body;

  // Basic validation
  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing eventId' });
  }

  if (!ticketType || (ticketType !== 'RSVP' && ticketType !== 'Paid')) {
    return res.status(400).json({ error: 'Invalid or missing ticketType' });
  }

  if (ticketType !== 'RSVP' && (!price || typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Invalid or missing price for paid tickets' });
  }

  if (!eventDate || isNaN(new Date(eventDate))) {
    return res.status(400).json({ error: 'Invalid or missing eventDate' });
  }

  if (!attendeeInfo || typeof attendeeInfo !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing attendeeInfo' });
  }

  try {
    let paymentIntent = null;
    if (ticketType !== 'RSVP') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100),
        currency: 'zar',
        payment_method_types: ['card'],
      });
    }

    const event = await Event.findOne({ event_id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const ticket = new Ticket({
      event_id: event._id,
      user_id: userId,
      ticket_type: ticketType,
      price: ticketType === 'RSVP' ? 0 : price,
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
        message: 'RSVP successful',
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

const buyTicket2 = async (req, res) => {
  const { eventId, ticketType, price, eventDate } = req.body;
  const userId = req.user._id;


  // Basic validation
  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing eventId' });
  }


  const validTicketTypes = ['Paid', 'RSVP', 'General Admission', 'VIP', 'Early Bird'];
  if (!ticketType || !validTicketTypes.includes(ticketType)) {
    return res.status(400).json({ error: 'Invalid or missing ticketType' });
  }

  if (ticketType !== 'RSVP' && (!price || typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Invalid or missing price for paid tickets' });
  }

  if (!eventDate || isNaN(new Date(eventDate))) {
    return res.status(400).json({ error: 'Invalid or missing eventDate' });
  }

  try {
    // Find the event by ID
    const event = await Event.findOne({ event_id: eventId }) || await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if(event.current_attendee_list.includes(userId)){
      return res.status(401).json({error:"You already the ticket for this event."});
    }

    if(event && event.current_attendees + 1 > event.max_attendees){
      return res.status(401).json({error:"maximum attendance reached"});
    }

    let ticket;

    if (ticketType === 'RSVP') {
      ticket = new Ticket({
        event_id: event._id,
        user_id: userId,
        ticket_type: ticketType,
        price: 0,
        event_date: eventDate,
        payment_status: 'Paid',
      });
      
      await ticket.save();
      event.current_attendees+=1;
      event.current_attendee_list.push(ticket.user_id);
      await event.save();

      // Generate QR code after saving the ticket
      const qrCodeData = `Ticket ID: ${ticket._id}, Event ID: ${event._id}`;
      ticket.qr_code = await QRCode.toDataURL(qrCodeData);
      await ticket.save();
      const ticketdetails = await Ticket.findById(ticket._id).populate("event_id");

      return res.status(200).json({
        success: true,
        message: 'RSVP successful',
        ticket:ticketdetails,
      });
    }

    // Create a product in Stripe for the event if it doesn't already exist
    const product = await stripe.products.create({
      name: event.title,
      images: [event.images[0]], // Ensure this is an array
    });

    // Create a price for the product
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // price in cents
      currency: 'zar',
      product: product.id,
    });

    // Create a Stripe Checkout session for paid tickets
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: stripePrice.id, // Use the created price ID
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/tickets/cancel`,
    });

    // Create the ticket with payment status as Pending
    ticket = new Ticket({
      event_id: event._id,
      user_id: userId,
      ticket_type: ticketType,
      price: price,
      stripe_payment_intent_id: session.id, // Store session ID
      event_date: eventDate,
      payment_status: 'Pending',
    });

    await ticket.save();

    // Return session URL to the client
    res.status(200).json({ sessionId: session.id,url: session.url });

  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(500).json({ error: 'Failed to process ticket purchase' });
  }
};

const confirmPayment = async (req, res) => {
  // const sessionId = req.query.session_id;
  const { session_id } = req.params;

  try {
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    let session = null;
    try {
      session =  await stripe.checkout.sessions.retrieve(session_id);
    } catch (error) {
      session = null;
    }

    // Verify that the session exists and is completed
    if (session && session.payment_status === 'paid') {
      const ticket = await Ticket.findOne({ stripe_payment_intent_id: session_id });

      if (ticket) {
        // Update ticket payment status to 'Paid'
        ticket.payment_status = 'Paid';
        const qrCodeData = `Ticket ID: ${ticket._id}, Event ID: ${ticket.event_id}`;
        ticket.qr_code = await QRCode.toDataURL(qrCodeData);
        await ticket.save();
        
        // Find the event by ID
        const event = await Event.findById(ticket.event_id);
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        if(!event.current_attendee_list.includes(ticket.user_id)){
          event.current_attendees+=1;
          event.current_attendee_list.push(ticket.user_id);
          await event.save();
        }
        const ticketdetails = await Ticket.findById(ticket._id).populate("event_id");
        
        return res.status(200).json({
          success: true,
          message: 'Payment successful',
          ticket:ticketdetails,
        });
      } else {
        return res.status(404).json({ error: 'Ticket not found' });
      }
    }
    else {
      const ticket = await Ticket.findById(session_id );
      if (ticket) {
        const ticketdetails = await Ticket.findById(ticket._id).populate("event_id");
        return res.status(200).json({
          success: true,
          message: 'Payment successful',
          ticket:ticketdetails,
        });
      } else {
        return res.status(400).json({ error: 'Claming unsuccessful' });
      }
    }
  } catch (error) {
    console.error('Error handling success route:', error);
    res.status(500).json({ error: 'Failed to process success' });
  }
};

const cancelPayment = async (req, res) => {
  // const sessionId = req.query.session_id;
  const { session_id } = req.params;


  try {
    // Delete the ticket associated with the session ID
    const ticket = await Ticket.findOneAndDelete({ stripe_payment_intent_id: session_id });

    if (ticket) {
      return res.status(200).json({ success: true, message: 'Payment cancelled.' });
    } else {
      return res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error('Error handling cancel route:', error);
    res.status(500).json({ error: 'Failed to process cancellation' });
  }
};

const scanTicket = async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id; // Organizer

  // Basic validation
  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing ticketId' });
  }

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

  // Basic validation
  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing ticketId' });
  }

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

  // Basic validation
  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing ticketId' });
  }

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

  // Basic validation
  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing ticketId' });
  }

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
  const userId = req.user._id;

  try {
    const tickets = await Ticket.find({user_id:userId}).populate('event_id').sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};


module.exports = {
  buyTicket2,
  confirmPayment,
  cancelPayment,
  scanTicket,
  cancelTicket,
  requestRefund,
  getTicket,
  getAllTickets,
};
