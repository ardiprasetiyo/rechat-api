const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')
const jwtHelper = require('../middleware/jwt-helper')
const validationSchema = require('../middleware/validator-schema')

/* GET home page. */
router.post('/register',  validationSchema.registerSchema(), validationSchema.validate, AuthController.register)
router.post('/login', validationSchema.loginSchema(), validationSchema.validate, AuthController.login)

module.exports = router;
