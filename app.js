const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const connectionString = require('./util/database');

const app = express();

const feedRoutes = require('./routes/feed')

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

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
