import * as express from 'express';
let app = express();
import * as mongoose from 'mongoose';
mongoose.Promise = global.Promise;
var transformPlugin = require("./mongoose-transform");

mongoose.connect(process.env.MONGO_URL);

import {authenticate, default as usersRouter, init} from 'users';
init({plugins : [transformPlugin.default]});
app.use(authenticate);
app.use('/users', usersRouter);
export = app;