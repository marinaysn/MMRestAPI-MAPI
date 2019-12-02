const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectionString = require('./util/database');
const path = require('path');
const app = express();
const multer = require('multer');
const grapgQlHTTP = require('express-graphql');
const grapgQlSchema = require('./graphql/schema')
const graphQlResolver = require('./graphql/resolvers')


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
  next();
});

app.use('/graphql', grapgQlHTTP({
  schema: grapgQlSchema,
  rootValue: graphQlResolver
}))


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
