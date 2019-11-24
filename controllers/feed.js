const { validationResult } = require('express-validator');
const Post = require('../models/post');


exports.getPosts = ((req, res, next)=>{

    Post.find()
    .then( posts =>{
        res.status(200).json({message: 'Found Posts', posts: posts});
    })
    .catch(err => {
        let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
            const error = new Error(str)
            if (!err.statusCode){
               error.statusCode = 500; 
            }
            next(error);
    });

   
});

exports.createPost = ( req, res, next) => {
    //Create post in db
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const date = new Date();

    const errors = validationResult(req);

    if(!errors.isEmpty()){
       // console.log(errors)
        console.log(errors.array()[0].msg)
        const errMsg = new Error(errors.array()[0].msg);
        errMsg.httpStatusCode = 422;
        errMsg.message = errors.array()[0].msg;
        throw errMsg;
        // return res.status(422).json({
        //     message: errors.array()[0].msg,
        //     errors: errors.array()
        // })
    }

    const post = new Post({
        title: title, 
        content: content, 
        imageUrl: '1.jpg',
        creator: { name: 'Anna'}
    });

    post.save().then( result => {
       // console.log(result);
        res.status(201).json({
            message: 'Post Created!',
            post: result
        })
    }).catch(err => {
        let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
            const error = new Error(str)
            if (!err.httpStatusCode){
               error.httpStatusCode = 500; 
            }
            next(error);
    })
};

exports.getSinglePost = (req, res, next) =>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const err = new Error('Cannot find this post');
            err.httpStatusCode = 404;
            throw err;
        }
        res.status(200).json({message: 'Post found', post: post});


    })
    .catch(err =>{
        let str = err.errmsg.substring(err.errmsg.indexOf(' '), err.errmsg.indexOf(':'))
            const error = new Error(str)
            if (!err.statusCode){
               error.statusCode = 500; 
            }
            next(error);
    })
};