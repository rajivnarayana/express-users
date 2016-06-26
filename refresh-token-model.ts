import * as mongoose from 'mongoose';
import crypto = require('crypto');

const REFRESH_TOKEN_LIFETIME = 7 * 24 * 3600 * 1000;

let Schema = new mongoose.Schema({
    user_id : { type: String, required: true },
    refresh_token : { type : String},
    expiresAt : { type : Date, default : () => { return new Date(Date.now() + REFRESH_TOKEN_LIFETIME);}}
}, {
    timestamps: true
})

Schema.pre('save', async function(next) {
    var model = this;

    if (!model.isNew) return next();

    try {
        model.refresh_token = await generateRandomToken();
        next();
    } catch (exception) {
        next(exception);
    }
});

var generateRandomToken = async () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(256, (error: Error, buf: Buffer) => {
            if (error) {
                return reject(new Error('Could not generate token'));
            }
            resolve(crypto.createHash('sha1').update(buf).digest('hex'));
        })
    });
}

export var RefreshTokenSchema = mongoose.model('refresh_tokens', Schema);