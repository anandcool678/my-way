const express = require('express');

const router = express.Router();
const{ addVehicle, getVehicle} = require('./controller');


router.route('/addVehicle').post(addVehicle);
router.route('/getVehicle').get(getVehicle);


module.exports = router;