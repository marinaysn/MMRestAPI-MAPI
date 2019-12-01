const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

const ITEMS_PER_PAGE = 5

exports.getPosts = async (req, res, next) => {

    const currentPage = req.query.page || 1

    //ITEMS_PER_PAGE called in Front End
    const ITEMS_PER_PAGE = 5;

    try {

        const totalItems = await Post.find().countDocuments();

        const posts = await Post.find()
            .skip((currentPage - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.status(200).json({ message: 'Found Posts', posts: posts, totalItems: totalItems });
    }
    catch (err) {
        const error = new Error('Sorry, cannot load posts!')
        if (!err.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.createPost = async (req, res, next) => {
    //Create post in db

    //first check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errMsg = new Error(errors.array()[0].msg);
        errMsg.httpStatusCode = 422;
        errMsg.message = errors.array()[0].msg;
        throw errMsg;
    }

    //get user's data
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    if (!req.file) {
        const err = new Error('Cannot file image file');
        err.httpStatusCode = 422;
        throw err;
    }
    const imageUrl = req.file.path.replace("\\", "/");

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    post.save().then(result => {

        return User.findById(req.userId)
    })
        .then(user => {

            let postsItems = ((user.posts.length + 1) === 1) ? ' post' : ' posts'
            let NumOfPostsStatus = 'Author of ' + (user.posts.length + 1) + postsItems

            creator = user;
            user.status = NumOfPostsStatus
            user.posts.push(post);
            return user.save();
        }).then(result => {

            res.status(201).json({
                message: 'Post Created!',
                post: post,
                creator: { _id: creator._id, name: creator.name }
            })
        })
        .catch(err => {


            const error = new Error('Error')
            if (!err.httpStatusCode) {
                error.httpStatusCode = 500;
            }
            next(error);
        })
};

exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error('Cannot find this post');
                err.httpStatusCode = 404;
                throw err;
            }
            res.status(200).json({ message: 'Post found', post: post });


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

exports.updatePost = (req, res, next) => {

    //first check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        const errMsg = new Error(errors.array()[0].msg);
        errMsg.httpStatusCode = 422;
        errMsg.message = errors.array()[0].msg;
        throw errMsg;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;

    let imageUrl = req.body.image;

    if (req.file) {
        //imageUrl = req.file.path
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const err = new Error('No image added');
        err.statusCode = 422;
        throw err;
    }
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const err = new Error('Cannot find this post');
                err.httpStatusCode = 404;
                throw err;
            }

            //check if user is authorized to update post
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not Authorized!');
                error.statusCode = 403;
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Post updated', post: result });
        })
        .catch(err => {
            // let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
            const error = new Error('Cannot update.')
            if (!err.httpStatusCode) {
                error.httpStatusCode = 500;
            }
            next(error);
        })
};


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            //check if user created this post

            if (!post) {
                const err = new Error('Cannot find this post');
                err.httpStatusCode = 404;
                throw err;
            }

            //check if user is authorized to delete post
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not Authorized!');
                error.statusCode = 403;
                throw error;
            }

            clearImage(post.imageUrl)
            return Post.findByIdAndRemove(postId);
        })
        .then(result => {

            return User.findById(req.userId)

        })
        .then(user => {

            user.posts.pull(postId);
            return user.save()
        })
        .then(result => {


            res.status(200).json({ message: 'Deleted Post' });
        })
        .catch(err => {
            // let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))

            const error = new Error('Cannot delete the post')
            if (!err.httpStatusCode) {
                error.httpStatusCode = 500;
            }
            next(error);
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}


exports.updateStatus = (req, res, next) => {

    const newStatus = req.body.status;

    User.findById(req.userId)
        .then(user => {

            if (!user) {
                const error = new Error('Cannot find user');
                error.statusCode = 401;
                throw error;
            }
            user.status = newStatus;
            return user.save();

        })
        .then(result => {

            res.status(200).json({ message: 'User status is updated' });
        })
        .catch(err => {
            // let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
            const error = new Error('Cannot update.')
            if (!err.httpStatusCode) {
                error.httpStatusCode = 500;
            }
            next(error);
        })
};

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                const error = new Error('Cannot find user');
                error.statusCode = 401;
                throw error;
            }
            return res.status(200).json({ status: user.status })

        }).catch(err => {
            const error = new Error('Cannot update.')
            if (!err.httpStatusCode) {
                error.httpStatusCode = 500;
            }
            next(error);
        })
}