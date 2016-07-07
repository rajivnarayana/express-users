var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var transformPlugin = require("./mongoose-transform");

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/rufio-test');

var usersRouter = require('../');
usersRouter.init({url : process.env.MONGO_URL || 'mongodb://localhost/rufio-test', plugins : [transformPlugin.default]});
app.use(usersRouter.authenticate);
app.use('/users', usersRouter.default);
module.exports = app;