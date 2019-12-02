const express = require('express');
const feedController = require('../controllers/feed');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Enter Valid Email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email address already exists')
                    }
                })
        }).normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .not()
        .isEmpty()
], authController.signup)

router.post('/login', authController.login)

module.exports = router;