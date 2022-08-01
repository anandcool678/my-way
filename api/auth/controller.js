const ErrorResponse = require('../../util/errorResponse');
const asyncHandler = require('../../middleware/async');
const User = require('../user/model');
const { generateFromEmail } = require("unique-username-generator");
const validatePhoneNumber = require('validate-phone-number-node-js');

exports.register = asyncHandler(async (req, res, next)=>{
    const {user_Name,user_Email,user_Phone_Number, user_Password} = req.body;
    let user_Username;
    if(req.body.user_Username==null){
        const t = generateFromEmail(
            user_Email,
            3
        );
        console.log(t);
        user_Username=t;
        
    }
    
    // req.body.user_Username.replace(generate_Username); 
    const validate_Phone_Number = validatePhoneNumber.validate(req.body.user_Phone_Number);
    if(!validate_Phone_Number){
        return next(new ErrorResponse('Please enter valid phone number',400));
    }
    const user = await User.create({user_Name,user_Email,user_Phone_Number, user_Password,user_Username});

    sendTokenResponse(user, 200, res);
    console.log(user);
});

exports.login = asyncHandler(async (req, res, next) => {
    const {user_Email, user_Password} = req.body;

    const user = await User.findOne({user_Email}).select('+user_Password');
    

    // Validate email & password
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 400));
    }
    console.log(user);
    const isMatch = await user.matchPassword(user_Password);
    

    if (!isMatch) {
        console.log(user_Password);
        return next(new ErrorResponse('Invalid password', 401));
    }
    // Check for user
    sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {},
    });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.body.id).select('+user_Password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }
    console.log(user);

    user.user_Password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: Number(new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: true
    };
    res.status(statusCode).cookie('token', token, options).json({success: true, token});
};
