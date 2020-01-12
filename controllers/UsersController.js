// Library
const bcryptjs = require('bcryptjs')
const redis = require('redis') // Caching Library
const jsonify = require('redis-jsonify')
const asyncRedis = require('async-redis')

// Model
const UserModel = require('../models/UsersModel')

// Initializing Redis
redis.debug_mode = true
const client = jsonify(asyncRedis.decorate( redis.createClient(11412, 'redis-11412.c85.us-east-1-2.ec2.cloud.redislabs.com') ))    
client.auth('wirXx81wGsTklACoCpAZ2lZPkfCLfuOv')

client.on('error', function(err){
    console.log("RedisErr: " + err)
})


// Controllers Logic
exports.get = async (req, res) => 
{
    const userID = req.decodedToken.userID
    const cacheKey = 'prfl:' + userID // Set Redis Key
    
    let cacheExpired = await client.ttl(cacheKey)
    if( cacheExpired > 0 ){
        
        const cacheData = await client.get(cacheKey)
        return res.status(200).send({'statusCode' : 200, 'message' : 'Success', 'data' : cacheData}).end()
    }

    try{
        const userData = await UserModel.get({'userID' : userID}, ['username', 'fullname', 'biography', 'profilePicture'])

        if( userData === null ){
            throw new Error('ACCOUNT_NOT_FOUND')
        }

        await client.setex(cacheKey, 60, userData)
        return res.status(200).send({'statusCode' : 200, 'message' : 'Success', 'data' : [userData]})

    }catch(e){
        if( e.message === 'ACCOUNT_NOT_FOUND' ){
           return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'}).end()
        }
    }
}


exports.update = async(req, res) => 

{
    const requestData = req.body
    const userID = req.decodedToken.userID
    const cacheKey = 'prfl:' + userID

    let newData = {}
    Object.keys(requestData).forEach(e => {
       if( requestData[e] ){
            newData[e] = `${requestData[e]}`
       }    
    })

    try{
        const updatedData = await UserModel.update({'userID' : userID}, newData)
        if( updatedData.nModified < 1){
            throw new Error('NO_UPDATE_CHANGES')
        }

        await client.del(cacheKey)
        return res.status(200).send({'statusCode' : 200, 'message' : 'Your profile is now updated'})
    }catch(e){
        if( e.message === 'NO_UPDATE_CHANGES' ){
            return res.status(422).send({'statusCode' : 422, 'message' : 'Your Data Is Up To Date, No Changes Made'})
        } else {
            return res.status(500).send({'statusCode' : 500, 'message' : 'Internal Server Error'})
        }
    } 
}


exports.updatePassword = async (req, res) => 

{
    const userID = req.decodedToken.userID
    const cacheKey = 'prfl:' + userID

    try{
        const userData = await UserModel.get({'userID' : userID}, ['password'])
        if( userData === null ){
            throw new Error('ACCOUNT_NOT_FOUND')
        } 

        const passwordVerify = await bcryptjs.compare(req.body.oldPassword, userData.password)  

        if( passwordVerify ){
            const updatedData = await UserModel.update({'userID' : userID}, {'password' : bcryptjs.hashSync(req.body.password, 8)})
            if( updatedData.nModified < 1 ){
                throw new Error('NO_UPDATE_CHANGES')
            }

            await client.del(cacheKey)
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

exports.delete = async (req, res) => 

{
    const userID = req.decodedToken.userID
    const cacheKey = 'prfl:' + userID
    try{
        const deletedUser = await UserModel.delete({'userID': userID})
        if( deletedUser.n < 1 ){
            throw new Error('NO_ACCOUNT_DELETED')
        } else {
            client.del(cacheKey)
            res.status(200).send({'statusCode': 200, 'message': 'Account is deleted'})
        }
    }catch(e){
        if( e.message === 'NO_ACCOUNT_DELETED' ){
            return res.status(422).send({'statusCode': 422, 'message': 'No Account Deleted' })
        } else {
            return res.status(500).send({'statusCode': 500, 'message': 'Internal server error' })
        }
        
    }
}