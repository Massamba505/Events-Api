const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');
const { allEvents,  updateEvent, createEvent, allUpcomingEvents, allInProgressEvents, allPastEvents, sort, EventDetails, cancelEvent } = require('../controllers/events.controller');

///api/events

router.get('/', allEvents);
router.get('/upcoming-events', allUpcomingEvents);
router.get('/inprogress-events', allInProgressEvents);
router.get('/past-events', allPastEvents);


router.patch('/:id/cancel', cancelEvent);

router.get('/sort-by', sort);

router.get('/:id', EventDetails);

router.post('/new', authenticate, createEvent);

router.put('/update/:eventId', authenticate, updateEvent);

module.exports = router;
