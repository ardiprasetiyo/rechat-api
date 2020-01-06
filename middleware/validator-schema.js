const { check, validationResult } = require('express-validator')


// ---------------------------//
//    AUTH VALIDATION SCHEMA  //
// ---------------------------//             

exports.registerSchema = (req, res, next) => {
    return[ check('username').
            trim().
            notEmpty().
            withMessage('Username is required').
            escape(),
                           
            check('password').
            trim().
            notEmpty().
            withMessage('Password is required').
            escape().
            isLength({min: 8}).
            withMessage('Minimum length of password is 8 characters'),

            check('re-password').trim().notEmpty().withMessage('Please retyping your password').escape().custom((value ,{req}) => {
             if (value !== req.body.password) {
                     // trow error if passwords do not match
                     throw new Error("Passwords don't match");
                 } else {
                     return value;
                 }
                }),
                check('fullname').
                trim().
                notEmpty().
                withMessage('Fullname is required').
                escape(),

                check('bio').
                trim().
                escape(),
            
                check('email').trim()
                .notEmpty().
                withMessage('Email is required').
                isEmail().
                withMessage('Email Must Be A Valid Email')]
}


exports.loginSchema = (req, res) => {
    return [ check('username').
             trim().
             notEmpty().
             withMessage('Username is required'),
            
            check('password').
            trim().
            notEmpty().
            withMessage('Password is required')]
} 

exports.forgotVerifySchema = (req, res) => {
    return [ check('userID').trim().
             notEmpty().
             withMessage('No UserID Found').
             escape(),
            
             check('password').
             trim().
             notEmpty().
             withMessage('Password is required').
             isLength({min:8}).
             withMessage('Minimum length of password is 8 characters').
             escape(),

             check('verifyCode').
             trim().
             notEmpty().
             withMessage('Verification Code is required').
             escape(),
            
            check('re-password').
            trim().
            notEmpty().
            withMessage('Please retyping your password').escape().
            custom((value ,{req}) => {
                if (value !== req.body.password) {
                        // trow error if passwords do not match
                        throw new Error("Passwords don't match");
                    } else {
                        return value;
                    }
            })]
}




// ---------------------------//
//    USER VALIDATION SCHEMA  //
// ---------------------------//    


exports.updateProfileSchema = (req, res) => {
    return [ check('fullname').
            trim().
                escape(),
        
            check('biography').
            trim().
            escape().
            isLength({max : 150}).
            withMessage('Bio maximum length is 150 Characters')]
}


exports.changeProfilePasswordSchema = (req, res) => {
    return [ check('password').
            trim().
            escape().
            isLength({min: 8}).
            withMessage('Password minimum 8 characters length').
            notEmpty().
            withMessage('New Password is required'),
        
            check('re-password').
            trim().
            escape().
            notEmpty().
            withMessage('Password Confirmation is required').
            custom((value, {req}) => {
                if( value !== req.body.password ){
                    throw new Error('Password Doesnt Match')
                }else {
                    return value
                }
            }),
        
            check('oldPassword').
            trim().
            escape().
            notEmpty().
            withMessage('Old Password is required')]
} 






exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ) return res.status(422).send({'statusCode' : 422, 'message' : errors}).end()
    next()
}

