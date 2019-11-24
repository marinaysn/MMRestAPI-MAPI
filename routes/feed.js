const express = require('express');
const feedController = require('../controllers/feed');
const router = express.Router();
const { check, body } = require('express-validator');

//GET /feed/posts
router.get('/posts', feedController.getPosts);

//POST /feed/post
router.post('/post',
[
    body('title', 'Please enter valid title!')
    .trim()
    .isLength({min: 5})
    .isString(),

    body('content', 'Please enter valid content')
    .trim()
    .isLength({min: 5, max: 5500 })
    .isString()

], 
feedController.createPost);

router.get('/post/:postId', feedController.getSinglePost);

module.exports = router;