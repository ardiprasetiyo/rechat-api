// Modules
const express = require('express');
const router = express.Router();
const jwt = require('../middleware/jwt-helper')
const validatorSchema = require('../middleware/validator-schema')

// Controller
const Auth = require('../controllers/AuthController')


// Routes
router.post('/register',validatorSchema.registerAccount(), 
                        validatorSchema.validate, 
                        Auth.register)

router.post('/login',validatorSchema.loginAccount(), 
                     validatorSchema.validate, 
                     Auth.login)

router.post('/forgot', Auth.forgotPassword)

router.post('/forgot/verify',validatorSchema.forgotPassword(),
                             validatorSchema.validate, 
                             Auth.forgotVerify)

router.post('/token', jwt.verifyRefresh)

module.exports = router;
