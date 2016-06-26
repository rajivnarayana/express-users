var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/rufio-test', function(error) {
    if (error) {
        console.error(error);
    }
});

var usersRouter = require('../');
app.use(usersRouter.authenticate);
app.use('/users', usersRouter.default);
module.exports = app;