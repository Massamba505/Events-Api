const express = require('express');
const router = express.Router();
const { EditUserPreference, changePassword, changeEmail, changeFullnameOrNotified, getUserDetails, updateUserDetails } = require('../controllers/users.controller');

const { authenticate } = require('../middlewares/protect.middleware');
const upload = require('../utils/multerConfig');

router.get('/', authenticate, getUserDetails);

router.put('/update', authenticate, upload.single('image'), updateUserDetails);

router.put('/preferences', authenticate, EditUserPreference);

router.put('/new-password', authenticate, changePassword);

// router.put('/change-email', authenticate, changeEmail);

// router.put('/update-profile', authenticate, changeFullnameOrNotified);

module.exports = router;
