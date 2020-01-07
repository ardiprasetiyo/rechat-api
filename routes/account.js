const express = require('express')
const app = express()
const router = express.Router()
const UsersController = require('../controllers/UsersController')
const jwtHelper = require('../middleware/jwt-helper')
const validator = require('../middleware/validator-schema')


router.get('/', jwtHelper.jwtVerifyMiddleware, UsersController.getUserProfile)
router.post('/', jwtHelper.jwtVerifyMiddleware, validator.updateProfileSchema(), validator.validate, UsersController.updateUserProfile)
router.post('/password', jwtHelper.jwtVerifyMiddleware, validator.changeProfilePasswordSchema(), validator.validate, UsersController.updateUserPassword)
router.delete('/', jwtHelper.jwtVerifyMiddleware, UsersController.deleteUserAccount)

module.exports = router