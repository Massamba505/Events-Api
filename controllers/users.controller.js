const bcrypt = require("bcryptjs/dist/bcrypt");
const User = require("../models/user.model");
const UserPreference = require("../models/userpreference.model");
const { uploadImage } = require("../utils/azureBlob");
const path = require('path');
const fs = require('fs');
const Notification = require("../models/notification.model");

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user_id = req.user._id;

        // Check for required fields
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Old password and new password are required' });
        }

        // Retrieve user from database
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if old password matches
        let isMatch = false;
        if(!user.password){
            isMatch = true;
        }else{
            isMatch = await bcrypt.compare(oldPassword, user.password);
        }
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect old password' });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = {
            role:user.role,
            firstname: user.fullname.split(" ")[0],
            lastname: user.fullname.split(" ")[1] || '',
            email: user.email,
            about: user.about || '',
            photoUrl: user.profile_picture || '',
            push_notifications: user.push_notifications || {},
            comments: user.comments
        };
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllUserDetails = async (req, res) => {
    try {
        const users = await User.find({}).sort({createdAt:-1}).select('role fullname email about profile_picture');

        if (!users || users.length === 0) {
            return res.status(200).json([]);
        }

        // Map over the users to create the desired response format
        const userData = users.map(user => ({
            _id:user._id,
            role: user.role,
            fullname: user.fullname,
            email: user.email,
            about: user.about || '',  
            profile_picture: user.profile_picture || '' 
        }));

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, email, about, push_notifications, comments } = req.body;
        const imageFile = req.file; // Handle image upload (can be null)

        // Validate that at least one field is provided
        if (!fullname && !email && !about && push_notifications === undefined && comments === undefined && !imageFile) {
            return res.status(200).json({ error: 'Nothing Updated.' });
        }

        // Initialize the updateFields object
        const updateFields = {};

        // Add fields to the update object only if they are provided
        if (fullname) updateFields.fullname = fullname;
        if (email) updateFields.email = email;
        if (about) updateFields.about = about;
        if (push_notifications !== undefined) updateFields.push_notifications = push_notifications; // Handle boolean values
        
        // Handle comments: Convert 'true'/'false' strings to boolean
        if (comments !== undefined) {
            updateFields.comments = comments === 'true'; // Convert to boolean
        }

        let imageUrl = null; // Default to null if no new image is provided
        if (imageFile) {
            const imagePath = path.join(__dirname, '..', 'uploads', imageFile.filename); // Path where multer temporarily stores images

            // Upload image and get its URL
            imageUrl = await uploadImage(imagePath);
            updateFields.profile_picture = imageUrl;

            // Clean up temporary file asynchronously
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${imagePath}`, err);
                }
            });
        }

        // Update the user details in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('fullname email about push_notifications profile_picture comments');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prepare the response with updated user data
        const userData = {
            firstname: updatedUser.fullname.split(" ")[0],
            lastname: updatedUser.fullname.split(" ")[1] || '',
            email: updatedUser.email,
            about: updatedUser.about || '',
            photoUrl: updatedUser.profile_picture || '',
            push_notifications: updatedUser.push_notifications || {},
            comments: updatedUser.comments // This is already a boolean
        };
        res.status(201).json(userData);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updatePreferences = async (req, res) => {
    try {
      const userId = req.user._id;
      const { preferred_category } = req.body;
  
      let preferences = await UserPreference.findOne({ user_id: userId });
  
      if (!preferences) {
        preferences = new UserPreference({ user_id: userId, preferred_category });
      } else {
        preferences.preferred_category = preferred_category;
      }
  
      await preferences.save();
  
      res.status(200).json({ success: true, message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPreferences = async (req, res) => {
    try {
      const userId = req.user._id;
      const preferences = await UserPreference.findOne({ user_id: userId })
  
      if (!preferences) {
        return res.status(200).json({ preferred_category: [] });
      }
  
      res.status(200).json({ preferred_category: preferences.preferred_category });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ user_id:userId }).sort({ createdAt: -1 }).populate("event_id");

        // console.log(notifications);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.log("error at get notifications ", error)
        res.status(500).json({ error: 'Error fetching notifications.' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id; 

        const notificationId = req.params.id;

        // Find and delete the notification
        const result = await Notification.findOneAndDelete({
            _id: notificationId,
            user_id: userId 
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
    } catch (error) {
        console.log("Error deleting notification: ", error);
        res.status(500).json({ error: 'Error deleting notification.' });
    }
};


const getNotificationsNoRead = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(400).json({ error: 'User not authenticated.' });
        }

        const userId = req.user._id;

        // Fetch notifications where user_id matches and isRead is either false or undefined
        const notifications = await Notification.find({
            user_id: userId,
            $or: [{ isRead: false }, { isRead: { $exists: false } }]
        });

        // Respond with the fetched notifications
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.log("Error at get notifications: ", error);
        res.status(500).json({ error: 'Error fetching notifications.' });
    }
};


const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany({user_id: userId, $or: [{ isRead: false }, { isRead: { $exists: false } }]},{ $set: { isRead: true }});

        res.status(200).json({ success: true, message: 'Notifications marked as read.' });
    } catch (error) {
        console.log("Error at marking notifications as read: ", error);
        res.status(500).json({ error: 'Error marking notifications as read.' });
    }
};

const updateUserRole = async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.params.userId;
  
      // Check if role is valid
      const validRoles = ['organizer', 'admin', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
  
      // Find the user by ID and update the role
      const newuser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true } // Return the updated document
      );
  
      if (!newuser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({
        _id:newuser._id,
        role: newuser.role,
        fullname: newuser.fullname,
        email: newuser.email,
        about: newuser.about || '',  
        profile_picture: newuser.profile_picture || '' 
    });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    changePassword,
    getUserDetails,
    updateUserDetails,
    updatePreferences,
    getPreferences,
    getNotifications,
    markAsRead,
    getNotificationsNoRead,
    deleteNotification,
    getAllUserDetails,
    updateUserRole
}