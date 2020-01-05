const UsersModel = require('../models/UsersModel')
const tokenModel = require('../models/TokenModel')
const jwtHelper = require('../middleware/jwt-helper')
const bcryptjs = require('bcryptjs')
const gmailSend = require('gmail-send')
const gmailConfig = {user : 'rechatmessaging@gmail.com',
                     pass : 'apawelah'}

const register = ( req, res ) => {

    let userData = {
        'username': req.body.username,
        'password': bcryptjs.hashSync(req.body.password, 8),
        'fullname': req.body.fullname,
        'biography': req.body.bio,
        'email': req.body.email
    }

    let result = UsersModel.createUser(userData)
    result.then((result) => {
        return res.status(200).send({'statusCode' : 200, 'message' : 'Your account now is registered'}).end()
    }).catch( (err) => {
        if( err.code === 11000 ) { 
            return res.status(422).send({'statusCode' : 422, 'message' : 'Username is already taken'}).end() 
        } else { 
            return res.status(500).send({'statusCode' : 500, 'message' : 'Something wrong, try again'}).end() 
        }
    })

    
}

const login = (req, res) =>{
    const userData = { 'username': req.body.username,
                       'password': req.body.password }
    
    const userDatabase = UsersModel.getUser({'username' : userData.username})
    userDatabase.then((result) => {
        if( result === null ){
            res.status(401).send({'statusCode' : 401, 'message' : 'Account not registered'}).end()
        }

        const username = result.username
        const password = result.password
        const userID = result.userID
        const fullname = result.fullname
        const bio = result.biography
        const contact = result.contact
        const profilePicture = result.profilePicture

        // Checking For Matches Hash Bcrypt

        bcryptjs.compare(userData.password, password).then((result) => {
            if( !result ){
                res.status(403).send({'statusCode' : 403, 'message' : `Username ${username} founded but invalid password`}).end()
            }
        })
        

        const token = jwtHelper.jwtGenerate({'userID' : userID}, ( 60 * 60 * 24 * 7 * 4 ))

        // Preparing UserData For Response
        const userJSON = {userID, username, fullname, bio, contact, profilePicture, token}

        res.status(200).send({'statusCode' : 200, 'message' : 'Login Sucess', 'data' : userJSON}).end()

    }).catch((err) => {
        console.log(err)
        res.status(500).send({'statusCode' : 500, 'message' : 'Something Wrong'})
    })

}


const forgotPassword = ( req, res ) => {
    const email = req.body.email

    UsersModel.getUser({'email' : email}, ['email', 'userID']).then((result) => {
        
        const userEmail = result.email
        const userID = result.userID
        const verifyCode = Math.random().toString().split('.')[1].substr(0, 4)

        gmailConfig.to = userEmail
        gmailConfig.subject = 'Password Recovery'
        gmailConfig.text = `Your Code Is ${verifyCode}`
        
        gmailSend()(gmailConfig).then((result) => {
            
            tokenModel.createToken({'userID' : userID, 'tokenCode' : verifyCode, 'expiredDate' : Date.now() + 99999, 'tokenID' : 'FORGOT_PASS'}).then((result) =>{
                res.status(200).send({'statusCode' : 200, 'message' : `The verification code is sent to your email ( ${email} )`, 'data' : {'userID' : userID}}).end()
            }).catch((err) => {
                console.log(err)
                res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
            })

        }).catch((err) => {
            console.log(err)
            res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        })
        
    }).catch((err) => {
        console.log(err)
        res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    })
}


const logout = (req, res) => {
    const token = req.headers.authorization
    tokenModel.createToken({'tokenCode' : token, 'tokenID' : 'TOKEN_BLACKLIST'}).then(result => {
        return res.status(200).send({'statusCode' : 200, 'message' : 'Logout Success'}).end()
    }).catch(err => {
        console.log(err)
        return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
    })
}



const forgotVerify = (req,res) => {
    const userData = {'userID' : req.body.userID,
                      'verifyCode' : req.body.verifyCode,
                      'password': req.body.password}
    
    tokenModel.getToken({'userID' : userData.userID, 'tokenCode' : userData.verifyCode, 'tokenID' : 'FORGOT_PASS'}).then((result) => {
        if( result === null ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Invalid Code'}).end()
        }

        if( result.expiredDate < Date.now() ){
            tokenModel.deleteToken({'userID' : result.userID}).then(() => {
                res.status(422).send({'statusCode' : 422, 'message' : 'Verification Code is expired'}).end()
            }).catch((err) => {
                throw new Error('Error Deleting Verification')
            })
        }

        UsersModel.updateUser({'userID' : userData.userID}, {'password' : bcryptjs.hashSync(userData.password, 8)}).then(() => {
            
            tokenModel.deleteToken({'userID' : result.userID}).then(() => {
               res.status(200).send({'statusCode' : 200, 'message' : 'Your password account sucessfully changed'}).end()
            }).catch((err) => {
                throw new Error('Error Deleteing Verification')
            })

        }).catch((err) => {
            throw new Error('Error Updating User')
        })


    }).catch((err) => {
        console.log(err)
    })
}



exports.register = register
exports.login = login
exports.forgotPassword = forgotPassword
exports.forgotVerify = forgotVerify
exports.logout = logout