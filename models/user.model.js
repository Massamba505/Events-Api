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

    get_notified: {
      type: Boolean, 
      default: true 
    },
    
    resetPasswordToken: String,
    resetPasswordExpires: Date
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
