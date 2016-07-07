var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var transformPlugin = require("./mongoose-transform");

mongoose.connect(process.env.MONGO_URL);

var usersModule = require('users');
usersModule.init({plugins : [transformPlugin.default]});
app.use(usersModule.authenticate);
app.use('/users', usersModule.default);
module.exports = app;