const { check, validationResult } = require('express-validator')

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
                escape() ]
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


exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ) return res.status(422).send({'statusCode' : 422, 'message' : errors}).end()
    next()
}