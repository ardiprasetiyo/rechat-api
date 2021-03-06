// Modules
const jwt = require('../middleware/jwt-helper')
const bcryptjs = require('bcryptjs')
const gmailSend = require('gmail-send')
const gmailConfig = {user : '',
                     pass : ''}

const uniqid = require('uniqid')

// Models
const UsersModel = require('../models/UsersModel')
const TokenModel = require('../models/TokenModel')


// Controllers Logic
exports.register = async ( req, res ) => 
{

    let userData = {
        'username': req.body.username,
        'password': bcryptjs.hashSync(req.body.password, 8),
        'fullname': req.body.fullname,
        'biography': req.body.biography,
        'email': req.body.email,
        'userID': uniqid()
    }

    try{
       await UsersModel.create(userData)
       return res.status(201).send({'statusCode' : 201, 'message' : 'Your account now is registered'}).end()
    } catch(e) {
        console.log(e.message)
        if( e.code === 11000 ) { 
            const errField = e.errmsg.split('index: ')[1].split('_1')[0]
            return res.status(400).send({'statusCode' : 442, 'message' : `${errField} is already taken`}).end() 
        } else { 
            return res.status(500).send({'statusCode' : 500, 'message' : 'Something wrong, try again'}).end() 
        }
    }
}

exports.login = async (req, res) =>
{
    const userData = { 'username': req.body.username,
                       'password': req.body.password }
    
    try {
        const userDatabase = await UsersModel.get({'username' : userData.username})
        
        if( userDatabase === null ){
            throw new Error('USER_NOT_REGISTERED')
        }

        const username = userDatabase.username
        const password = userDatabase.password
        const userID = userDatabase.userID
        const fullname = userDatabase.fullname
        const bio = userDatabase.biography
        const contact = userDatabase.contact
        const profilePicture = userDatabase.profilePicture


        try{
        // Checking For Matches Hash Bcrypt
        const verifyPassword = await bcryptjs.compare(userData.password, password)
            if( !verifyPassword ){
               throw new Error('PASSWORD_NOT_MATCH')
            }
        } finally{
            
        }

        const token = await jwt.generate({'userID' : userID}, ( 60 * 15 ))
        const jwtToken = token.jwt
        const jwtRefreshToken = token.jwtRefresh
        const userJSON = {userID, username, fullname, bio, contact, profilePicture, jwtToken, jwtRefreshToken}
        res.status(201).send({'statusCode' : 201, 'message' : 'Login Sucess', 'data' : userJSON}).end()


    } catch(e) {
        console.log(e.message)
        if( e.message === 'USER_NOT_REGISTERED' ){
            return res.status(401).send({'statusCode' : 401, 'message' : 'Account not registered'}).end()
        }
        else if( e.message === 'PASSWORD_NOT_MATCH' ){
            return res.status(403).send({'statusCode' : 403, 'message' : "Password doesn't match"}).end()
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}


exports.forgotPassword = async ( req, res ) => 
{
    const email = req.body.email

    try {

    const userData = await UsersModel.get({'email' : email}, ['email', 'userID'])

    if( userData == null ){
        throw new Error('USER_NOT_FOUND')
    }
    
    const userEmail = userData.email
    const userID = userData.userID
    const verifyCode = Math.random().toString().split('.')[1].substr(0, 4)

    gmailConfig.to = userEmail
    gmailConfig.subject = 'Password Recovery'
    gmailConfig.text = `Your Code Is ${verifyCode}, It Will Be Expired In 15 Minutes`

    try{
        await gmailSend()(gmailConfig)
        await TokenModel.create({'userID' : userID, 'tokenCode' : verifyCode, 'expiredDate' : Date.now() + 900000, 'tokenID' : 'FORGOT_PASS'})
        return res.status(201).send({'statusCode' : 201, 'message' : `Email is sent to your email account ( ${userEmail} )`, 'data' : {'userID' : userID}}).end()
    } finally{
    }

    }catch(e) {
        console.log(e.message)
        if( e.message === 'USER_NOT_FOUND' ){
            return res.status(403).send({'statusCode' : 403, 'message' : 'Email not registered to any user account'}).end()
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}


exports.forgotVerify = async (req,res) => {
    const userData = {'userID' : req.body.userID,
                      'verifyCode' : req.body.verifyCode,
                      'password': bcryptjs.hashSync(req.body.password, 8)}
    try{
        const verifyToken = await TokenModel.get({'userID' : userData.userID, 'tokenCode' : userData.verifyCode, 'tokenID' : 'FORGOT_PASS'})
        if( verifyToken === null ){
            throw new Error('INVALID_TOKEN')
        }

        try {
            
            if( verifyToken.expiredDate > Date.now() ){
                await TokenModel.delete({'userID' : userData.userID})
                await UsersModel.update({'password' : userData.password})
                return res.status(201).send({'statusCode' : 201, 'message' : 'Your password account sucessfully changed'}).end()
            } else {
                throw new Error('TOKEN_EXPIRED')
            }

        }finally{
        }
        
    }catch(e){
        console.log(e)
        if( e.message === 'INVALID_TOKEN' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Invalid Token'}).end()
        } else if ( e.message === 'TOKEN_EXPIRED' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Expired Token'}).end()
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}
