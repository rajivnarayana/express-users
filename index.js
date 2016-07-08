"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const router = require('./router');
const mongoose = require("mongoose");
const user_model_1 = require("./user-model");
const module_1 = require('./module');
function authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.query.access_token) {
            try {
                let payload = yield module_1.verify(req.query.access_token);
                let user = yield module_1.read(payload.user);
                if (!user) {
                    return next('No such user exists!');
                }
                else {
                    req.user = user;
                    next();
                }
            }
            catch (error) {
                return next(new Error('Invalid or expired token'));
            }
        }
        else {
            next();
        }
    });
}
exports.authenticate = authenticate;
__export(require('./module'));
function init(options) {
    // mongoose.connect(options.url);
    if (options.plugins) {
        options.plugins.forEach((plugin) => {
            user_model_1.Schema.plugin(plugin);
            exports.UsersModel = mongoose.model('User', user_model_1.Schema);
        });
    }
}
exports.init = init;
exports.UsersModel = mongoose.model('User', user_model_1.Schema);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map