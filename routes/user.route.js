const express = require('express');
const router = express.Router();
const { changePassword, getUserDetails, updateUserDetails, getPreferences, updatePreferences, getNotifications, getNotificationsNoRead, markAsRead, deleteNotification, getAllUserDetails,updateUserRole } = require('../controllers/users.controller');

const { authenticate } = require('../middlewares/protect.middleware');
const upload = require('../utils/multerConfig');

router.get('/', authenticate, getUserDetails);

router.get('/all', authenticate, getAllUserDetails);

router.put('/:userId/role', updateUserRole);

router.put('/update', authenticate, upload.single('image'), updateUserDetails);

router.put('/new-password', authenticate, changePassword);

router.get('/preferences', authenticate, getPreferences);

router.put('/preferences', authenticate, updatePreferences);

router.get('/notifications', authenticate, getNotifications);

router.delete('/notifications/:id', authenticate, deleteNotification);

router.get('/notifications/latest', authenticate, getNotificationsNoRead);

router.get('/notifications/read', authenticate, markAsRead);


module.exports = router;
