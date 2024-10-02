const express = require('express');
const router = express.Router();
const { buyTicket, confirmPayment, cancelTicket, requestRefund, getTicket, getAllTickets } = require('../controllers/ticket.controller');
const { authenticate } = require('../middlewares/protect.middleware');

// Ticket routes

router.post('/buy', authenticate, buyTicket);

router.post('/confirm-payment', authenticate, confirmPayment);

router.post('/cancel/:ticketId', authenticate, cancelTicket);

router.post('/refund/:ticketId', authenticate, requestRefund);

router.get('/:ticketId', authenticate, getTicket);

router.get('/user/:userId', authenticate, getAllTickets);


module.exports = router;
