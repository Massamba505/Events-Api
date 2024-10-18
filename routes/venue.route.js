const express = require('express');
const router = express.Router();
const {
  getAllVenues,
  addVenue,
  updateVenue,
  deleteVenue,
  getVenueByName,
} = require('../controllers/venue.controller');

const { authenticate } = require('../middlewares/protect.middleware');
router.get('/', getAllVenues);
router.get('/:name', getVenueByName);
router.post('/',authenticate, addVenue);
router.put('/:name',authenticate,updateVenue);
router.delete('/:name',authenticate, deleteVenue);

module.exports = router;
