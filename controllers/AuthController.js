const UsersModel = require('../models/UsersModel')
const tokenModel = require('../models/TokenModel')
const jwtHelper = require('../middleware/jwt-helper')
const bcryptjs = require('bcryptjs')
const gmailSend = require('gmail-send')
const gmailConfig = {user : 'rechatmessaging@gmail.com',
                     pass : 'apawelah'}

exports.register = async ( req, res ) => {

    let userData = {
        'username': req.body.username,
        'password': bcryptjs.hashSync(req.body.password, 8),
        'fullname': req.body.fullname,
        'biography': req.body.biography,
        'email': req.body.email
    }

    try{
       await UsersModel.createUser(userData)
       return res.status(200).send({'statusCode' : 200, 'message' : 'Your account now is registered'}).end()
    } catch(e) {
        if( e.code === 11000 ) { 
            const errField = e.errmsg.split('index: ')[1].split('_1')[0]
            return res.status(422).send({'statusCode' : 422, 'message' : `${errField} is already taken`}).end() 
        } else { 
            return res.status(500).send({'statusCode' : 500, 'message' : 'Something wrong, try again'}).end() 
        }
    }
}

exports.login = async (req, res) =>{
    const userData = { 'username': req.body.username,
                       'password': req.body.password }
    
    try {
        const userDatabase = await UsersModel.getUser({'username' : userData.username})
        
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

        const token = await jwtHelper.jwtGenerate({'userID' : userID}, ( 60 * 60 * 24 * 7 * 4 ))
        const userJSON = {userID, username, fullname, bio, contact, profilePicture, token}
        res.status(200).send({'statusCode' : 200, 'message' : 'Login Sucess', 'data' : userJSON}).end()


    } catch(e) {
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


exports.forgotPassword = async ( req, res ) => {
    const email = req.body.email

    try {

    const userData = await UsersModel.getUser({'email' : email}, ['email', 'userID'])

    if( userData == null ){
        throw new Error('USER_NOT_FOUND')
    }
    
    const userEmail = userData.email
    const userID = userData.userID
    const verifyCode = Math.random().toString().split('.')[1].substr(0, 4)

    gmailConfig.to = userEmail
    gmailConfig.subject = 'Password Recovery'
    gmailConfig.text = `Your Code Is ${verifyCode}`

    try{
        await gmailSend()(gmailConfig)
        await tokenModel.createToken({'userID' : userID, 'tokenCode' : verifyCode, 'expiredDate' : Date.now() + 99999, 'tokenID' : 'FORGOT_PASS'})
        return res.status(200).send({'statusCode' : 200, 'message' : `Email is sent to your email account ( ${userEmail} )`, 'data' : {'userID' : userID}}).end()
    } finally{
    }

    }catch(e) {
        if( e.message === 'USER_NOT_FOUND' ){
            return res.status(403).send({'statusCode' : 403, 'message' : 'Email not registered to any user account'}).end()
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}


exports.logout = (req, res) => {
    const token = req.headers.authorization
    tokenModel.createToken({'tokenCode' : token, 'tokenID' : 'TOKEN_BLACKLIST'}).then(result => {
        return res.status(200).send({'statusCode' : 200, 'message' : 'Logout Success'}).end()
    }).catch(err => {
        console.log(err)
        return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    })
}



exports.forgotVerify = async (req,res) => {
    const userData = {'userID' : req.body.userID,
                      'verifyCode' : req.body.verifyCode,
                      'password': bcryptjs.hashSync(req.body.password, 8)}
    try{
        const verifyToken = await tokenModel.getToken({'userID' : userData.userID, 'tokenCode' : userData.verifyCode, 'tokenID' : 'FORGOT_PASS'})
        if( verifyToken === null ){
            throw new Error('INVALID_TOKEN')
        }

        try {
            
            if( verifyToken.expiredDate > Date.now() ){
                await tokenModel.deleteToken({'userID' : userData.userID})
                await UsersModel.updateUser({'password' : userData.password})
                return res.status(200).send({'statusCode' : 200, 'message' : 'Your password account sucessfully changed'}).end()
            } else {
                throw new Error('TOKEN_EXPIRED')
            }

        }finally{
        }
        
    }catch(e){
        if( e.message === 'INVALID_TOKEN' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Invalid Token'}).end()
        } else if ( e.message === 'TOKEN_EXPIRED' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Expired Token'}).end()
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}