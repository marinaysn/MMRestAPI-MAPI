const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {

    //first check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors)
        console.log(errors.array()[0].msg)
        const errMsg = new Error(errors.array()[0].msg);
        errMsg.statusCode = 422;
        errMsg.message = errors.array()[0].msg;
        errMsg.data = errors.array();
        throw errMsg;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12)
    .then(hashedPwd =>{
        const user = new User({
            email: email,
            password: hashedPwd,
            name: name
        });
        return user.save()
    })
    .then(result =>{

        res.status(201).json({message: 'New User Created', userId: result._id})
    })
    .catch(err => {
        let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
        const error = new Error(str)
        if (!err.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    })
};

exports.login = (req, res, next) =>{

    const password = req.body.password
    const email = req.body.email;
    let loadedUser;

    User.findOne({email: email})
    .then(user =>{

        if(!user){
            const error = new Error('User with this email cannot be found')
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual =>{

        if(!isEqual){
            const error = new Error('Wrong Password. Try again!')
            error.statusCode = 401;
            throw error; 
        }

    // token = jwt.sign(payload, privateKEY, signOptions);
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'secret', {expiresIn: '1h'})

        console.log("Token - " + token)

        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
       
        const error = new Error('Cannot validate User')
        if (!err.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    })
}