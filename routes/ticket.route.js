const express = require('express');
const { buyTicket, confirmPayment, cancelTicket, getTicket, requestRefund, getAllTickets } = require('../controllers/ticket.controller');
const {authenticate} = require('../middlewares/protect.middleware');
const router = express.Router();

// Ticket routes

router.post('/buy', authenticate, buyTicket);

router.post('/confirm-payment', authenticate, confirmPayment);

router.post('/cancel/:ticketId', authenticate, cancelTicket);

router.post('/refund/:ticketId', authenticate, requestRefund);

router.get('/:ticketId', authenticate, getTicket);

router.get('/user/:userId', authenticate, getAllTickets);


module.exports = router;
