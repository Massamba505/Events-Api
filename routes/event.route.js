const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');
const { allEvents, allUpcomingEvents, allInProgressEvents, allPastEvents, sort, EventDetails, createEvent,createEventNoImage, updateEvent, cancelEvent, search2 } = require('../controllers/events.controller');
const upload = require("../utils/multerConfig");

// Event routes (unprotected)
router.get('/', allEvents);
router.get('/search', search2);
router.get('/upcoming-events', allUpcomingEvents);
router.get('/inprogress-events', allInProgressEvents);
router.get('/past-events', allPastEvents);
router.get('/sort-by', sort);
router.get('/:id', EventDetails);

// Protected routes
router.post('/new', authenticate, upload.array('images'), createEvent);
router.post('/new-no-image', authenticate, createEventNoImage);
router.put('/update/:id', authenticate, updateEvent);
router.patch('/:id/cancel', cancelEvent);

module.exports = router;
