const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    user_Name: {
        type: String,
        required: [false,'Please provide your first name'],
    },
    user_Email: {
        type: String,
        required: [false, 'Please provide an email address'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add valid email address.'],
    },
    user_Phone_Number:{
        type: Number,
        unique:true,
        required:[true,"Phone number required"],
    },
    user_Username:{
        type: String,
        unique:true,
        required:[false],
    },
    user_Password: {
        type: String,
        required: [false, 'Password can not be blank'],
        // select: false,
        minlength: 8,
        default:"",
        // maxlength:20,
        match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    },
    user_Phone_OTP:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('user_Password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.user_Password = await bcrypt.hash(this.user_Password, salt);
});

userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

userSchema.methods.matchPassword = async function(enteredPassword) {
    // eslint-disable-next-line no-return-await
    return await bcrypt.compare(enteredPassword, this.user_Password);
};
userSchema.methods.matchType = async function(enterdType){
    
}
module.exports = mongoose.model('User', userSchema);
