"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require('express');
const module_1 = require('./module');
const http_status_codes_1 = require('http-status-codes');
const bodyParser = require('body-parser');
let router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
var relativeURL = (relativeURL) => {
    return relativeURL;
};
router.use((req, res, next) => {
    res.locals.relativeURL = relativeURL = (relativeURL) => {
        return req.baseUrl + relativeURL;
    };
    next();
});
router.param('user', (req, res, next, id) => __awaiter(this, void 0, void 0, function* () {
    try {
        req.object = yield module_1.read(id);
        if (!req.object) {
            return next(new Error('No such user found'));
        }
        next();
    }
    catch (error) {
        next(error);
    }
}));
router.get('/me', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(req.user);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/check_availability', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send({ available: yield module_1.checkAvailability(req.query.username) });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/signup', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(yield module_1.signup(req.body.username, req.body.password));
    }
    catch (error) {
        next(error);
    }
}));
router.post('/email_signup', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(yield module_1.signupWithEmail(req.body.email, req.body.password));
    }
    catch (error) {
        next(error);
    }
}));
router.post('/login', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(yield module_1.login(req.body.username, req.body.password));
    }
    catch (error) {
        next(error);
    }
}));
router.get('/:user', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(req.object);
    }
    catch (error) {
        next(error);
    }
}));
router.post('/token', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(yield module_1.renewAccessToken(req.body.refresh_token));
    }
    catch (error) {
        next(error);
    }
}));
router.post('/device_token', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        res.status(http_status_codes_1.OK).send(yield module_1.findByIdAndUpdate(req.user.id, { $set: { device_token: req.body.device_token } }));
    }
    catch (error) {
        next(error);
    }
}));
module.exports = router;
//# sourceMappingURL=router.js.map