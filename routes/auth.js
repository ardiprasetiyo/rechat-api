const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')
const jwtHelper = require('../middleware/jwt-helper')
const validationSchema = require('../middleware/validator-schema')

/* GET home page. */
router.post('/register',  validationSchema.registerSchema(), validationSchema.validate, AuthController.register)
router.post('/login', validationSchema.loginSchema(), validationSchema.validate, AuthController.login)
router.post('/forgot', AuthController.forgotPassword)
router.post('/forgot/verify', validationSchema.forgotVerifySchema(), validationSchema.validate, AuthController.forgotVerify)
router.post('/logout', jwtHelper.jwtVerifyMiddleware, AuthController.logout)

module.exports = router;
