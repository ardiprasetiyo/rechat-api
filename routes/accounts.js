// Modules
const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt-helper')
const validator = require('../middleware/validator-schema')

// Controller
const Users = require('../controllers/UsersController')

// Routes
router.get('/', jwt.verify, Users.get)

router.post('/', jwt.verify, 
                 validator.updateAccount(), 
                 validator.validate, 
                 Users.update)

router.post('/password', jwt.verify, 
                          validator.updateAccountPassword(), 
                          validator.validate, 
                          Users.updatePassword)

router.delete('/', jwt.verify, Users.delete)

module.exports = router