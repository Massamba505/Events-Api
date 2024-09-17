const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');
const { allEvents, allUpcomingEvents, allInProgressEvents, allPastEvents, sort, EventDetails, createEvent, updateEvent, cancelEvent } = require('../controllers/event');

// Event routes
router.get('/', allEvents);
router.get('/upcoming-events', allUpcomingEvents);
router.get('/inprogress-events', allInProgressEvents);
router.get('/past-events', allPastEvents);
router.get('/sort-by', sort);
router.get('/:id', EventDetails);

// Protected routes
router.post('/new', authenticate, createEvent);
router.put('/update/:id', authenticate, updateEvent);
router.patch('/:id/cancel', cancelEvent);

module.exports = router;
