const bcrypt = require("bcryptjs/dist/bcrypt");
const User = require("../models/user.model");
const UserPreference = require("../models/userpreference.model");
const { uploadImage } = require("../utils/azureBlob");
const path = require('path');
const fs = require('fs');

const EditUserPreference = async(req,res)=>{
    try {
        const { preferred_category } = req.body;

        const user_id = req.user._id;

        if (!Array.isArray(preferred_category)) {
            return res.status(400).json({ error: "preferred_categories are required" });
        }

        if(!preferred_category){
            preferred_category = [];
        }

        const userExists = await User.findById(user_id);
        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }

        let usersPreference = await UserPreference.findOne({ user_id });

        if (usersPreference) {
            usersPreference.preferred_category = preferred_category;
        } else {
            usersPreference = new UserPreference({
                user_id,
                preferred_category
            });
        }

        await usersPreference.save();

        res.status(200).json({ message: "Preferences updated successfully" });
    } catch (error) {
        console.error('Error in updating preferences: ', error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

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
        const userId = req.user._id;

        const user = await User.findById(userId).select('fullname email about profile_picture push_notifications');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(user);
        // Format the response as desired
        const userData = {
            firstname: user.fullname.split(" ")[0],
            lastname: user.fullname.split(" ")[1],
            email: user.email,
            about: user.about || '', // Optional, if 'about' field is present
            photoUrl: user.profile_picture || '', // Photo URL
            push_notifications: user.push_notifications || {}, // If user has notification preferences
            comments:user.comments || true
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, email, about, push_notifications, comments } = req.body;
        const imageFile = req.file; // Handle image upload (can be null)

        if (!fullname && !email && !about && push_notifications === undefined && comments === undefined && !imageFile) {
            return res.status(400).json({ error: 'At least one field (fullname, email, about, push notifications, or comments) must be provided.' });
        }

        // Initialize the updateFields object
        const updateFields = {};

        // Add fields to the update object only if they are provided
        if (fullname) updateFields.fullname = fullname;
        if (email) updateFields.email = email;
        if (about) updateFields.about = about;
        if (push_notifications !== undefined) updateFields.push_notifications = push_notifications; // Ensure we handle boolean values
        
        // Handle comments: convert 'true'/'false' strings to boolean
        if (comments !== undefined) {
            updateFields.comments = comments === 'true'; // Convert to boolean
        }

        console.log(updateFields);
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

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    EditUserPreference,
    changePassword,
    getUserDetails,
    updateUserDetails
}