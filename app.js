const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectionString = require('./util/database');
const path = require('path');
const app = express();

const feedRoutes = require('./routes/feed')

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) =>{
    console.log(error);
    const status = error.statusCode || 500
    const msg = error.message;
    res.status(status).json({message: msg});
})

//database connection: blog
mongoose
.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(result =>{
    console.log('Connected!')
    app.listen(8080);
})
.catch(err =>console.log(err))
