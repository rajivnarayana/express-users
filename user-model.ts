import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import bcrypt = require('bcrypt');
import plugin from './mongoose-transform';
const SALT_WORK_FACTOR = 10;

let Schema = new mongoose.Schema({
    //username : { type: String, index: { unique: true } },
    name:{type: String},
    password : { type : String, select: false , required : true, hide: true},
    passwordResetToken : { type : String },
	email : { 
        index: { unique: true },        
        type : String, 
        default : "" ,
        validate : { 
            validator : function validateEmail(email) {
                if(email.length == 0) {
                	return true;
                }	
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }    
        }
    },
    device_token:{type:String, hide:true}
})


Schema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

// Instance method to compare password
// UserSchema.findOne('...id...', '+password', function(err, user) {
//      user.comparePassword('password from req', 'hased password from doc', callback);
// })
Schema.method('comparePassword', function(candidatePassword) : Promise<boolean> {
    let password = this.password;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, password, function(err, isMatch) {
            if (err) return reject(err);
            resolve(isMatch);
        });
    })
});

Schema.plugin(plugin);
Schema.plugin(mongoosePaginate);

export var UserSchema = mongoose.model('User', Schema);
