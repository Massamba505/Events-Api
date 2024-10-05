const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/protect.middleware');
const { allEvents, allUpcomingEvents, allInProgressEvents, allPastEvents, sort, EventDetails, createEvent,createEventNoImage, updateEvent, cancelEvent, search2, deleteEvent, MyEvents, getPopularEvents, getRecommendedEvents, Calender } = require('../controllers/events.controller');
const upload = require("../utils/multerConfig");

// Event routes (unprotected)
router.get('/', allEvents);
router.get('/calender', Calender);
router.get('/search', search2);
router.get('/upcoming-events', allUpcomingEvents);
router.get('/inprogress-events', allInProgressEvents);
router.get('/past-events', allPastEvents);
router.get('/popular', getPopularEvents);
router.get('/sort-by', sort);

// Protected routes
router.get('/myevents',authenticate, MyEvents);
router.get('/recommendation',authenticate, getRecommendedEvents);
router.post('/new', authenticate, upload.array('images'), createEvent);
router.post('/new-no-image', authenticate, createEventNoImage);
router.put('/update/:id', authenticate, updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/cancel', cancelEvent);
// router.get('/myevents',authenticate, MyEvents);

router.get('/:id',EventDetails);

module.exports = router;
