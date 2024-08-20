var express = require('express');
var router = express.Router();
const { TicketReg, AllTicketAndRegistration } = require('../controllers/ticket.controller');
const { authenticate } = require('../middlewares/protect.middleware');

router.post('/register', authenticate, TicketReg);

router.get('/my-tickets', authenticate, AllTicketAndRegistration);

module.exports = router;
