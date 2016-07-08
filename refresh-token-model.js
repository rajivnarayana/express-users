"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongoose = require('mongoose');
const crypto = require('crypto');
const REFRESH_TOKEN_LIFETIME = 7 * 24 * 3600 * 1000;
let Schema = new mongoose.Schema({
    user_id: { type: String, required: true },
    refresh_token: { type: String },
    expiresAt: { type: Date, default: () => { return new Date(Date.now() + REFRESH_TOKEN_LIFETIME); } }
}, {
    timestamps: true
});
Schema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        var model = this;
        if (!model.isNew)
            return next();
        try {
            model.refresh_token = yield generateRandomToken();
            next();
        }
        catch (exception) {
            next(exception);
        }
    });
});
var generateRandomToken = () => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(256, (error, buf) => {
            if (error) {
                return reject(new Error('Could not generate token'));
            }
            resolve(crypto.createHash('sha1').update(buf).digest('hex'));
        });
    });
});
exports.RefreshTokenSchema = mongoose.model('refresh_tokens', Schema);
//# sourceMappingURL=refresh-token-model.js.map