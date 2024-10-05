const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { notifyUser } = require('./nodemail.util');

const notifyAttendees = async (event, message) => {
    try {
        // Fetch all attendees/users associated with the event
        const attendees = event.current_attendee_list;
        
        if (attendees.length === 0) {
            console.log('No attendees found for the event.');
            return;
        }

        // Create an array of notification objects and a notification task for each user
        const notifications = attendees.map((user) => ({
            user_id: user._id,
            event_id: event._id,
            message,
            isRead: false
        }));

        // Notify each user asynchronously and store the notifications
        const notifyAndInsertPromises = attendees.map(async (user, index) => {
            // Notify the user (e.g., via email or in-app notification)
            await notifyUser(user, event, message);

            // Return the notification for bulk insert
            return notifications[index];
        });

        // Wait for all notifications to be sent and ready for insertion
        const resolvedNotifications = await Promise.all(notifyAndInsertPromises);

        // Bulk insert notifications into the database
        await Notification.insertMany(resolvedNotifications);
        
        console.log('Notifications successfully sent and saved.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};

module.exports = notifyAttendees;
