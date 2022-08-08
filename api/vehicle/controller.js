const ErrorResponse = require('../../util/errorResponse');
const asyncHandler = require('../../middleware/async');
const Vehicle = require('./model');
const User = require('../user/model');


// Register New Vehicle
// @Routes    /api/v1/vehicle/addVehicle
// @Method    POST

exports.addVehicle = asyncHandler(async (req, res, next) => {
    let {vehicle_Name,vehicle_Number,user_Email} = req.body;
    const user = await User.findOne({user_Email});
    if(!user){
        res.status(400).json({
            success: false,
            error:`User not registered`,
            user:null,
        })
        return next(new ErrorResponse("User not registered",400));
    };
    const checkVehicle = await Vehicle.findOne({vehicle_Number});
    if(checkVehicle){
        res.status(400).json({
            success: false,
            error:`Vehicle already registered`,
            vehicle:null,
        });
        return next(new ErrorResponse("Vehicle already registered",400));
    }
    const vehicle = await Vehicle.create({vehicle_Name,vehicle_Number,user_Email});
    console.log(vehicle);
    res.status(200).json({
        success: true,
        error: null,
        vehicle,
        user
    });
    sendTokenResponse(vehicle,200,res);
});



// Get Vehicle details
// @Routes    /api/v1/vehicle/getVehicle
// @Method    POST

exports.getVehicle = asyncHandler(async (req, res, next) => {
    const {user_Email} = req.body;
    const vehicle = await Vehicle.find({user_Email});
    if(!vehicle){
        res.status(400).json({
            success: false,
            error:`Vehicle not registered`,
            vehicle:null,
        })
        return next(new ErrorResponse("Vehicle not registered",400));
    }
    res.status(200).json({
        success: true,
        error: null,
        vehicle
    });
});
