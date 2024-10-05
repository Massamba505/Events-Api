const express = require('express');
const router = express.Router();
const { changePassword, getUserDetails, updateUserDetails, getPreferences, updatePreferences } = require('../controllers/users.controller');

const { authenticate } = require('../middlewares/protect.middleware');
const upload = require('../utils/multerConfig');

router.get('/', authenticate, getUserDetails);

router.put('/update', authenticate, upload.single('image'), updateUserDetails);

router.put('/new-password', authenticate, changePassword);

router.get('/preferences', authenticate, getPreferences);

router.put('/preferences', authenticate, updatePreferences);


module.exports = router;
