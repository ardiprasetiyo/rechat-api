const express = require('express')
const app = express()
const router = express.Router()
const UsersController = require('../controllers/UsersController')
const jwtHelper = require('../middleware/jwt-helper')
const validator = require('../middleware/validator-schema')


router.get('/profile', jwtHelper.jwtVerifyMiddleware, UsersController.getProfile)
router.post('/profile', jwtHelper.jwtVerifyMiddleware, validator.updateProfileSchema(), validator.validate, UsersController.updateProfile)
router.post('/profile/password', jwtHelper.jwtVerifyMiddleware, validator.changeProfilePasswordSchema(), validator.validate, UsersController.updateProfilePassword)

module.exports = router