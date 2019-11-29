const express = require('express');
const feedController = require('../controllers/feed');
const router = express.Router();
const { check, body } = require('express-validator');

const isAuth = require('../middleware/isAuth')
//GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

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


router.put('/post/:postId',
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
feedController.updatePost
)

router.delete('/post/:postId', feedController.deletePost);
module.exports = router;