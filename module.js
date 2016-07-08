"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const index_1 = require("./index");
const refresh_token_model_1 = require("./refresh-token-model");
const jsonwebtoken_1 = require('jsonwebtoken');
const mongoose_1 = require('mongoose');
const SECRET = process.env['JWT_SECRET'] || 'my-secret';
const ACCESS_TOKEN_LIFETIME = '1h';
const ACCESS_TOKEN_LIFETIME_IN_MILLI = 60 * 60 * 1000;
function sign(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var token = yield getNewRefreshTokenForUserId(userId);
        token.access_token = yield jsonwebtoken_1.sign({ user: userId }, SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME });
        token.access_token_expires_at = new Date(new Date().getTime() + ACCESS_TOKEN_LIFETIME_IN_MILLI).getTime();
        return token;
    });
}
exports.sign = sign;
function verify(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield jsonwebtoken_1.verify(token, SECRET);
    });
}
exports.verify = verify;
function list(page, limit, sort, ascending, role) {
    return __awaiter(this, void 0, Promise, function* () {
        let check = {};
        check[sort] = ascending ? 1 : -1;
        let populateQuery = [{ path: 'place', select: 'name address' }];
        return yield index_1.UsersModel.paginate({ role: role }, { page: page, limit: limit, populate: (populateQuery), sort: check });
    });
}
exports.list = list;
/**
 * Checks availability of a given username
 * Also validates if username is not null and other validations.
 */
function checkAvailability(username) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!username) {
            throw new Error('Username required to check availability');
        }
        username = username.trim();
        if (username.trim().length < 3) {
            throw new Error('Username should be atleast 3 characters long');
        }
        return 0 == (yield count({ username: username }));
    });
}
exports.checkAvailability = checkAvailability;
function signup(username, password) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!username || !password) {
            throw new Error('Username and password required to signup');
        }
        let user = yield index_1.UsersModel.create({ username: username, password: password });
        return yield sign(user.id);
    });
}
exports.signup = signup;
function signupWithEmail(email, password) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!email || !password) {
            throw new Error('Email and password required to signup');
        }
        let user = yield index_1.UsersModel.create({ email: email, password: password });
        return yield sign(user.id);
    });
}
exports.signupWithEmail = signupWithEmail;
function login(username, password) {
    return __awaiter(this, void 0, Promise, function* () {
        let userId = yield loginWithoutSign(username, password);
        return yield sign(userId);
    });
}
exports.login = login;
function loginWithoutSign(username, password) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!username || !password)
            throw new Error('The Username or password that you  entered doesnt match any account');
        let user = yield findOne({ username: username }, "+password");
        if (!user || !(yield user.comparePassword(password)))
            throw new Error('Invalid username or password');
        return user.id;
    });
}
exports.loginWithoutSign = loginWithoutSign;
function read(id) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new Error('Unknown user');
        }
        return yield index_1.UsersModel.findById(id).exec();
    });
}
exports.read = read;
function findOne(query, options) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!options) {
            options = {};
        }
        ;
        return yield index_1.UsersModel.findOne(query, options).exec();
    });
}
exports.findOne = findOne;
function findByIdAndUpdate(userId, body) {
    return __awaiter(this, void 0, Promise, function* () {
        let updates = {};
        let updatesSet = body.$set || {};
        if (updatesSet.name) {
            updates.name = updatesSet.name;
        }
        if (updatesSet.email) {
            updates.email = updatesSet.email;
        }
        if (updatesSet.email) {
            updates.username = updatesSet.email;
        }
        if (updatesSet.passwordResetToken) {
            updates.passwordResetToken = updatesSet.passwordResetToken;
        }
        body.$set = updates;
        let updatedUser = yield index_1.UsersModel.findByIdAndUpdate(userId, body, { new: true }).exec();
        if (updatesSet.password) {
            updatedUser.password = updatesSet.password;
            yield updatedUser.save();
            return updatedUser;
        }
        else {
            return updatedUser;
        }
    });
}
exports.findByIdAndUpdate = findByIdAndUpdate;
function findMany(query, options) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!options) {
            options = {};
        }
        ;
        return yield index_1.UsersModel.find(query, options).exec();
    });
}
exports.findMany = findMany;
function count(searchOptions) {
    return __awaiter(this, void 0, Promise, function* () {
        return yield index_1.UsersModel.count(searchOptions).exec();
    });
}
exports.count = count;
function search(page, limit, sort, ascending, search_by, _role) {
    return __awaiter(this, void 0, void 0, function* () {
        let check = {};
        check[sort] = ascending ? 1 : -1;
        return yield index_1.UsersModel.paginate({ $or: [
                { 'location': new RegExp(search_by, 'i'), role: _role },
                { 'username': new RegExp(search_by, 'i'), role: _role },
                { 'name': new RegExp(search_by, 'i'), role: _role }
            ]
        }, { page: page, limit: limit, sort: check });
    });
}
exports.search = search;
//Does not validate if the given user id is valid.
function getNewRefreshTokenForUserId(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return refresh_token_model_1.RefreshTokenSchema.create({ user_id: userId }).then((refreshTokenModel) => {
            return { refresh_token: refreshTokenModel.get('refresh_token'), refresh_token_expires_at: refreshTokenModel.expiresAt.getTime() };
        });
    });
}
function renewAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!refreshToken) {
            throw new Error('Refresh token needed to renew');
        }
        let refreshTokenModel = yield refresh_token_model_1.RefreshTokenSchema.findOne({ refresh_token: refreshToken }).exec();
        if (!refreshTokenModel || refreshTokenModel.expiresAt.getTime() < new Date().getTime()) {
            throw new Error('Expired or revoked refresh token');
        }
        return { access_token: yield jsonwebtoken_1.sign({ user: refreshTokenModel.user_id }, SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME }),
            access_token_expires_at: new Date(new Date().getTime() + ACCESS_TOKEN_LIFETIME_IN_MILLI).getTime() };
    });
}
exports.renewAccessToken = renewAccessToken;
//# sourceMappingURL=module.js.map