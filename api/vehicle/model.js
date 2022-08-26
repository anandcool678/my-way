const mongoose = require('mongoose');
const User = require('../user/model');

const vehicleSchema = new mongoose.Schema({
    vehicle_Name: {
        type: String,
        required: [true, 'Please provide a vehicle name'],
    },
    vehicle_Number: {
        type: String,
        required: [true, 'Please provide a vehicle number'],
        unique: true,
    },
    user_Email:{
        type:String,
        ref:'User',
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
