const { validationResult } = require('express-validator');
const Post = require('../models/post');


exports.getPosts = ((req, res, next)=>{
    res.status(200).json({posts: [{
        _id: '1',
        title: 'Creating REST APIs with Node.js & TypeScript', content: 'A WebAPI consisting of endpoints to a request–response message system (JSON/XML) exposed as an HTTP-based server', createdAt: new Date(), imageUrl: 'images/1.jpg', creator: {
        name: 'Marina'
    }}]});
});

exports.createPost = ( req, res, next) => {
    //Create post in db
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const date = new Date();

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors)
        const errMsg = new Error(errors.array()[0].msg);
        errMsg.httpStatusCode = 422;
        
        throw errMsg;
        // return res.status(422).json({
        //     message: errors.array()[0].msg,
        //     errors: errors.array()
        // })
    }

    const post = new Post({
        title: title, 
        content: content, 
        imageUrl: '1.jpeg',
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
            if (!err.statusCode){
               error.statusCode = 500; 
            }
            next(error);
    })

    
};

