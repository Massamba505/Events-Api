const express = require('express');
const router = express.Router();
const { EditUserPreference, changePassword, changeEmail, changeFullnameOrNotified, getUserDetails } = require('../controllers/users.controller');

const { authenticate } = require('../middlewares/protect.middleware');

router.get('/', authenticate, getUserDetails);

router.put('/preferences', authenticate, EditUserPreference);

router.put('/change-password', authenticate, changePassword);

router.put('/change-email', authenticate, changeEmail);

router.put('/update-profile', authenticate, changeFullnameOrNotified);

module.exports = router;
