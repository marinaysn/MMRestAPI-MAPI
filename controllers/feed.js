
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

    res.status(201).json({
        message: 'Post Created!',
        post: {_id: new Date().toISOString(), title: title, content: content, imageUrl: 'images/1.jpg', createdAt: date, creator: {name: 'Anna'}}
    })
};

