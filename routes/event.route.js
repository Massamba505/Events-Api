const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');
const { allEvents, allUpcomingEvents, allInProgressEvents, allPastEvents, sort, EventDetails, createEvent,createEventNoImage, updateEvent, cancelEvent, search2, deleteEvent, MyEvents } = require('../controllers/events.controller');
const upload = require("../utils/multerConfig");

// Event routes (unprotected)
router.get('/', allEvents);
router.get('/search', search2);
router.get('/upcoming-events', allUpcomingEvents);
router.get('/inprogress-events', allInProgressEvents);
router.get('/past-events', allPastEvents);
router.get('/sort-by', sort);
router.get('/:id',EventDetails);
router.get('/myevents', MyEvents);

// Protected routes
router.post('/new', authenticate, upload.array('images'), createEvent);
router.post('/new-no-image', authenticate, createEventNoImage);
router.put('/update/:id', authenticate, updateEvent);
router.delete('/:id', deleteEvent);
router.patch('/:id/cancel', cancelEvent);
// router.get('/myevents',authenticate, MyEvents);

module.exports = router;
