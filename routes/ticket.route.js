const express = require('express');
const router = express.Router();
const { buyTicket2, confirmPayment, cancelTicket, requestRefund, getTicket, getAllTickets, cancelPayment } = require('../controllers/ticket.controller');
const { authenticate } = require('../middlewares/protect.middleware');

// Ticket routes


// Updated Routes
router.post('/buy', authenticate, buyTicket2);

router.get('/success/:session_id', confirmPayment);

router.get('/cancel/:session_id', cancelPayment);

router.post('/refund/:ticketId', authenticate, requestRefund);

router.get('/:ticketId', authenticate, getTicket);

router.get('/', authenticate, getAllTickets);

module.exports = router;
