const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    about:{ 
        type: String, 
        default: ''
    },
    authId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['organizer', 'admin', 'user'],
        default: 'user'
    },
    profile_picture: { 
        type: String, 
        default: '' 
    },

    push_notifications: { 
        type: String, 
        enum: ['everything', 'nothing', 'email'],
        default: 'everything' 
    },

    comments: {
      type: Boolean, 
      default: true 
    },
    
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
