const express = require('express');
const router = express.Router();
const { buyTicket2, confirmPayment, scanTicket, requestRefund, getTicket, getAllTickets, cancelPayment } = require('../controllers/ticket.controller');
const { authenticate } = require('../middlewares/protect.middleware');

router.post('/buy', authenticate, buyTicket2);

router.get('/success/:session_id', confirmPayment);

router.get('/cancel/:session_id', cancelPayment);

router.post('/:ticketId/refund', authenticate, requestRefund);

router.get('/:ticketId', authenticate, getTicket);

router.post('/:ticketId/accept', authenticate, scanTicket);

router.get('/', authenticate, getAllTickets);

module.exports = router;
