const userModel = require('../models/UsersModel')
const bcryptjs = require('bcryptjs')

exports.getProfile = async (req, res) => {
    const userID = req.decodedToken.userID
    try{
        const userData = await userModel.getUser({'userID' : userID}, ['username', 'fullname', 'biography', 'profilePictures'])

        if( userData === null ){
            throw new Error('ACCOUNT_NOT_FOUND')
        }

        return res.status(200).send({'statusCode' : 200, 'message' : 'Success', 'data' : userData})

    }catch(e){
        if( e.message === 'ACCOUNT_NOT_FOUND' ){
           return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}


exports.updateProfile = async(req, res) => {
    const requestData = req.body
    const userID = req.decodedToken.userID
    let newData = {}
    Object.keys(requestData).forEach(e => {
       if( requestData[e] ){
            newData[e] = `${requestData[e]}`
       }    
    })

    try{
        const updatedData = await userModel.updateUser({'userID' : userID}, newData)
        if( updatedData.nModified < 1){
            throw new Error('NO_UPDATE_CHANGES')
        }
        return res.status(200).send({'statusCode' : 200, 'message' : 'Your profile is now updated'})
    }catch(e){
        if( e.message === 'NO_UPDATE_CHANGES' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Your Data Is Up To Date, No Changes Made'})
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'})
        }
    } 
}


exports.updateProfilePassword = async (req, res) => {
    const userID = req.decodedToken.userID

    try{
        const userData = await userModel.getUser({'userID' : userID}, ['password'])
        if( userData === null ){
            throw new Error('ACCOUNT_NOT_FOUND')
        } 

        const passwordVerify = await bcryptjs.compare(req.body.oldPassword, userData.password)

        if( passwordVerify ){
            const updatedData = await userModel.updateUser({'userID' : userID}, {'password' : bcryptjs.hashSync(req.body.password, 8)})
            if( updatedData.nModified < 1 ){
                throw new Error('NO_UPDATE_CHANGES')
            }

            return res.status(200).send({'statusCode' : 200, 'message' : 'Your Password Is Now Changed'})
        } else {
            throw new Error('PASSWORD_NOT_MATCH')
        }
    }catch(e){
        console.log(e)
        if( e.message === 'ACCOUNT_NOT_FOUND' ){
            return res.status(500).send({'statusCode' : 500, 'message' : 'No Account Founded - Internal Server Error'}).end()
        }
        else if( e.message  === 'PASSWORD_NOT_MATCH'){
            return res.status(403).send({'statusCode' : 403, 'message' : 'Old Password Doesnt Match'}).end()
        } else if( e.message === 'NO_UPDATE_CHANGES' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Your Data Is Up To Date, No Changes Made'})
        }else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'})
        }
    }
}