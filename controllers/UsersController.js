const userModel = require('../models/UsersModel')

const UsersController = {
    'createUser' : (req, res) => {
        // Validation Here
        const result = userModel.createUser({'username' : 'ardi', 'password' : 'arditea1234', 'firstname' : 'ardi', 'lastname' : 'prasetiyo'})
        result.then((result) => {
            console.log(result)
            res.send('User Created')
        }).catch( (err) => {
            console.log(err)
            res.send('Error')
        })
    },

    'updateUser' : (req, res) => {
        // Validation Here 
      const result = userModel.updateUser({'username' : 'ardi'}, {'firstname' : 'shafira', 'lastname' : 'Qolby'})
      result.then((result) => {
          console.log(result)
          res.send('User Updated')
      }).catch( (err) => {
          console.log(err)
          res.send('Error')
      } )
    },

    'deleteUser' : (req, res) => {
        // Validation Here
        const result = userModel.deleteUser({'username' : 'ardi'})
        result.then((result) => {
            console.log(result)
            res.send('User Deleted')
        }).catch((err) => {
            res.send('User Deleted!')
        })
    },

    'getUser' : (req, res) => {
        // Validation Here
        const result = userModel.getUser({'username' : 'ardi'})

        result.then((result) => {
            res.send(result).status(200)
        }).catch(e => {
            res.send('Some Error').status(500)
        })

    }
}

module.exports = UsersController