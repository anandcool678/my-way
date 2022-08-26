const ErrorResponse = require('../../util/errorResponse');
const asyncHandler = require('../../middleware/async');
const User = require('../user/model');
const { generateFromEmail } = require("unique-username-generator");
const validatePhoneNumber = require('validate-phone-number-node-js');

// Register New User 
// @routes      /api/v1/auth/register
// method       POST
exports.register = asyncHandler(async (req, res, next)=>{   
    let {user_Name,user_Email,user_Phone_Number, user_Password,user_Username} = req.body;
    const phoneExist = await User.findOne({user_Phone_Number});
    if(phoneExist){
        return res.status(400).json({
            success: false,
            error:"User already exists",
            user:null,
        });
        // return next(new ErrorResponse('User already exist',400));

    }

    if(user_Username==null){
        user_Username  = generateFromEmail(
            user_Email,
            2
        );
    }
    const validate_Phone_Number = validatePhoneNumber.validate(req.body.user_Phone_Number);
    if(!validate_Phone_Number){
        return next(new ErrorResponse('Please enter valid phone number',400));
    }
    
    const user = await User.create({user_Name,user_Email,user_Phone_Number, user_Password,user_Username});
    console.log(user);
    // res.send(user);
    return res.status(200).json({
        success: true,
        error:null,
        user:user,
    });
    // sendTokenResponse(user,200,res);


});

// Verify User
// @routes      /api/v1/auth/verifyUser
// method       POST

  exports.verifyUser = async (req, res, next) => {
    let{user_Phone_Number} = req.body;
    const user = await User.findOne({user_Phone_Number});
    if(!user){
        return res.status(400).json({
            success: false,
            error:"Phone number not found",
            user:null,
        });
    }
    user.isVerified = true;
    await user.save();
    console.log(user,"dwsd");
    return res.status(200).json({
        success: true,
        error:null,
        user:user,
    });

  };

// Login Existing User 
// @routes      /api/v1/auth/login
// method       POST
exports.login = asyncHandler(async (req, res, next) => {
    let {user_Email, user_Password} = req.body;
    // console.log(req.body.user_Password);
    user_Email = decodeURIComponent(req.body.user_Email);
    user_Password = decodeURIComponent(req.body.user_Password);
    // console.log(user_Email,"sksl");
    console.log(user_Password);
    const user = await User.findOne({user_Email}).select('+user_Password');
    
    console.log(user);
    // Validate email & password
    if (!user) {
        return res.status(402).json({
            success: false,
            error:`Invalid User`,
            user:null,
        });
        // return next(new ErrorResponse('Invalid credentials', 402));
    }
    
    const isMatch = await user.matchPassword(user_Password);
    

    if (!isMatch) {
        // console.log(user_Password);
        return res.status(401).json({
            success: false,
            error:`Invalid password`,
            user:null,
        });
        // sendTokenResponse(user, 401, res);
        // return next(new ErrorResponse('Invalid password', 401));
    }
    // Check for user
    res.status(200).json({
        success: true,
        error: null,
        user,
    });
    // res=user;
    // sendTokenResponse(user, 200, res);
});



// Logout Existing User 
// @routes      /api/v1/auth/logout
// method       GET
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


// update Password of existing user 
// @routes      /api/v1/auth/login
// method       POST
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.body.id).select('+user_Password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }
    console.log(user);

    user.user_Password = req.body.newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        error: null,
        user,
    });
    sendTokenResponse(user, 200, res);
});


// Update user details
// @routes      /api/v1/auth/update/:id
// method       PUT
exports.updateUser = asyncHandler(async(req, res, next) => {
    const {id,user_Phone_Number,user_Email,user_Name,user_Username} = req.body;
    const user = await User.findById(id);
    // console.log(user);
    // console.log(req.body.user_Phone_Number);
    if(!user){
        res.status(400).json({
            success: false,
            error:`User not found`,
            user:null,
        });
        return next(new ErrorResponse("User not registered",400));

    }
    console.log(user); 
    if(user.user_Username!=null){
        user.user_Username = generateFromEmail(
            req.body.user_Email,
            2
        );
    }
    user.user_Email = req.body.user_Email;
    // // user.user_Password = await fetch()
    user.user_Name = req.body.user_Name;

    await user.save();
    console.log(user); 
    res.status(200).json({
        success: true,
        error: null,
        user
    });
    sendTokenResponse(user,200,res);
    

});


// Add payment
// @routes      /api/v1/auth/addPayment/:id
// method       PUT
exports.addPoints = asyncHandler(async(req,res,next) =>{
    const{id,user_Email,payment} = req.body;

    const user = await User.findById(id);

    if(!user){
        return res.status(400).json({
            success: false,
            error:`User not found`,
            user:null,
        }); 
    }
    var point_to_add = payment * 0.8 *5;
    user.user_Points = user.user_Points + point_to_add;
    await user.save();
    console.log(user); 
    return res.status(200).json({
        success: true,
        error: null,
        user
    });
    // sendTokenResponse(user,200,res);


});

// Deduct Points
// @routes      /api/v1/auth/deductPoints/:id
// method       PUT

exports.deductPoints = asyncHandler(async(req,res,next) =>{
    const{id,points} = req.body;

    const user = await User.findById(id);

    if(!user){
        return res.status(400).json({
            success: false,
            error:`User not found`,
            user:null,
        }); 
    }
    // user.user_Points = ;
    if(user.user_Points - points<0){
        // user.user_Points = user.user_Points + points;
        return res.status(402).json({
            success: false,
            error:`Insufficient Fund`,
            user,
        }); 
    }
    user.user_Points = user.user_Points - points;

    await user.save();
    console.log(user,"Deduct POints"); 
    return res.status(200).json({
        success: true,
        error: null,
        user
    });
    // sendTokenResponse(user,200,res);


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
