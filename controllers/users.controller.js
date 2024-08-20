const bcrypt = require("bcryptjs/dist/bcrypt");
const User = require("../models/user.model");
const UserPreference = require("../models/userpreference.model");

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

const changePassword = async(req,res)=>{
    try {
        const { oldPassword, newPassword } = req.body;
        const user_id = req.user._id;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Old and new passwords are required' });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const changeEmail = async(req,res)=>{
    try {
        const { email } = req.body;
        const user_id = req.user._id;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(user_id, { email }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Email updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error changing email:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const changeFullnameOrNotified = async(req,res)=>{
    try {
        const { fullname, get_notified } = req.body;
        const user_id = req.user._id;

        if (!fullname) {
            return res.status(400).json({ error: 'Full name field is required' });
        }

        if (typeof get_notified !== 'boolean') {
            return res.status(400).json({ error: ' Get Notified field should be boolean' });
        }

        const updatedUser = await User.findByIdAndUpdate(user_id, {
            fullname,
            get_notified,
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    EditUserPreference,
    changePassword,
    changeEmail,
    changeFullnameOrNotified,
    getUserDetails
}