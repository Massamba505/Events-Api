const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const userModel = require('../models/user.model');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (email, subject, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, info };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error }; // Return error
    }
};

// Notification function based on user preferences
const notifyUser = async (userId, event, message) => {
    const user = await userModel.findById(userId);
    const subject = `Update on Event: ${event.title}`;
    const emailMessage = message;
    
    if (user.push_notifications === 'everything' || user.push_notifications === 'email') {
        await sendEmail(user.email, subject, emailMessage);
    }
    // You can add push notification logic here if using Firebase or other services
};


module.exports = {
    notifyUser,
    transporter,
    sendEmail
};