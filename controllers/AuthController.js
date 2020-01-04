const UsersModel = require('../models/UsersModel')
const jwtHelper = require('../middleware/jwt-helper')
const bcryptjs = require('bcryptjs')

const register = ( req, res ) => {

    date

    let userData = {
        'username': req.body.username,
        'password': bcryptjs.hashSync(req.body.password, 8),
        'fullname': req.body.fullname,
        'biography': req.body.bio,
        'token': jwtHelper.jwtGenerate({username: this.username, expired: Date.now() + 99999})
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

        const token = jwtHelper.jwtGenerate({'userID' : userID, 'expiredDate' : Date.now() + 99999999})

        
        // Preparing UserData For Response
        const userJSON = {userID, username, fullname, bio, contact, profilePicture, token}

        // Updating User Token
        UsersModel.updateUser({'userID' : userID}, {'token' : token}).then((result) => {
            res.status(200).send({'statusCode' : 200, 'message' : 'Login Sucess', 'data' : userJSON})
        }).catch((err) =>{
            res.status(500).send({'statusCode' : 500, 'message' : 'Something Wrong'})
        })


    }).catch((err) => {
        res.status(500).send({'statusCode' : 500, 'message' : 'Something Wrong'})
    })

}

exports.register = register
exports.login = login