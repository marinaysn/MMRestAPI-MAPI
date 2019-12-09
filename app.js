const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectionString = require('./util/database');
const path = require('path');
const fs = require('fs');
const { clearImage } = require('./util/clearImage');
const app = express();
const multer = require('multer');
const graphqlHTTP = require('express-graphql');
const grapgQlSchema = require('./graphql/schema')
const graphQlResolver = require('./graphql/resolvers')
const auth = require('./middleware/auth')

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

//configure storage for Files to use in a multer object
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    //cb(null, uuidv4())
    cb(null, file.originalname)
  }
})

//set Filter for Files to use in a multer object
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg') {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')); // image is coming from 


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS'){
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

// store/clean image
app.put('/post-image', (req, res, next) =>{

  if (!req.isAuth){
    throw new Error('Not autorize!')
  }
  if (!req.file){
     return res. status(200).json({message: 'No file provided!'})
  }
   if (req.body.oldPath){
     clearImage(req.body.oldPath)
   }

   return res.status(201).json({message: 'File stored', 
   filePath: req.file.path.replace('\\', '/') });
});


app.use(
  '/graphql',
  graphqlHTTP({
    schema: grapgQlSchema,
    rootValue: graphQlResolver,
    graphiql: true,

    customFormatErrorFn: error => ({   
      message: error.message || 'An error occurred.',
      code: error.originalError.code || 500,
      data: error.originalError.data
    })

  })
);


app.use((error, req, res, next) => {
  const status = error.httpStatusCode || 500
  const msg = error.message;
  const data = error.data
  res.status(status).json({ message: msg, data: data });
})

//database connection: blog
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(result => {
    console.log('Connected!')
    const server = app.listen(8080);
  })
  .catch(err => console.log(err))
