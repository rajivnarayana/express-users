import { UserModel as UserSchema } from "./index";
import { RefreshTokenSchema } from "./refresh-token-model";
import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';
import { Document, Types } from 'mongoose';
import * as crypto from 'crypto';

const SECRET : string = process.env['JWT_SECRET'] || 'my-secret';
const ACCESS_TOKEN_LIFETIME = '1h';
const ACCESS_TOKEN_LIFETIME_IN_MILLI = 60 * 60 * 1000;

export async function sign(userId) {
    var token : {access_token ?: string, access_token_expires_at?: number, refresh_token : string, refresh_token_expires_at : number} = await getNewRefreshTokenForUserId(userId);
    token.access_token = await jwtSign({user : userId}, SECRET, { expiresIn : ACCESS_TOKEN_LIFETIME});
    token.access_token_expires_at = new Date(new Date().getTime() + ACCESS_TOKEN_LIFETIME_IN_MILLI).getTime()
    return token;
}

export async function verify(token) {
    return await jwtVerify(token, SECRET);
}

export async function list(page, limit, sort, ascending, role) : Promise<any> {
    let check = {};
    check[sort] = ascending ? 1 : -1;
    let populateQuery = [{path:'place', select:'name address'}]
     return await UserSchema.paginate({role:role},{ page: page, limit: limit, populate:(populateQuery),sort: check }); 
}

/**
 * Checks availability of a given username
 * Also validates if username is not null and other validations.
 */
export async function checkAvailability(username: string) {
    if (!username) {
        throw new Error('Username required to check availability');
    }
    username = username.trim();
    if (username.trim().length < 3) {
        throw new Error('Username should be atleast 3 characters long');
    }
    
    return 0 == await count({username: username});
}

export async function signup(username: string, password: string) : Promise<any> {
    if (!username || !password) {
        throw new Error('Username and password required to signup');
    }

    let user: Document = await UserSchema.create({username: username, password: password});
    return await sign(user.id);        
}

export async function signupWithEmail(email: string, password: string) : Promise<any> {
    if (!email || !password) {
        throw new Error('Email and password required to signup');
    }

    let user: Document = await UserSchema.create({email: email, password: password});
    return await sign(user.id);        
}

export async function login(username: string, password: string) : Promise<any> {
    let userId = await loginWithoutSign(username, password);
    return await sign(userId);
}

export async function loginWithoutSign(username: string, password: string) : Promise<any> {
    if (!username || !password)
        throw new Error('The Username or password that you  entered doesnt match any account');
    let user : Document = await findOne({username: username}, "+password");
    if (!user || !(await user.comparePassword(password)))
        throw new Error('Invalid username or password');        
    return user.id;
}

export async function read(id: string) : Promise<Document> {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Unknown user');
    }
    return await UserSchema.findById(id).exec();
}

export async function findOne(query, options?:any ) : Promise<Document> {
    if (!options) { options = {} };
    return await UserSchema.findOne(query, options).exec();
}

export async function findByIdAndUpdate(userId, body ) : Promise<Document> {
    let updates : any = {};
    
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

    let updatedUser =  await UserSchema.findByIdAndUpdate(userId, body, { new : true }).exec();
    if (updatesSet.password) {
        updatedUser.password = updatesSet.password;
        await updatedUser.save();
        return updatedUser; 
    } else {
        return updatedUser;
    }
}

export async function findMany(query, options?:any ) : Promise<Document[]> {
    if (!options) { options = {} };
    return await UserSchema.find(query, options).exec();
}

export async function count(searchOptions) : Promise<number> {
    return await UserSchema.count(searchOptions).exec();
}

export async  function search(page, limit, sort, ascending,search_by,_role){
    let check = {};
    check[sort] = ascending ? 1 : -1;
    return await UserSchema.paginate(
        { $or:
            [
                {'location' : new RegExp(search_by, 'i'),role:_role},
                {'username' : new RegExp(search_by, 'i'),role:_role},
                {'name' : new RegExp(search_by, 'i'),role:_role}
            ]
        } ,{ page: page, limit: limit, sort: check })  
}

//Does not validate if the given user id is valid.
async function getNewRefreshTokenForUserId(userId) {
    return RefreshTokenSchema.create({user_id : userId}).then((refreshTokenModel) => {
        return {refresh_token : refreshTokenModel.get('refresh_token'), refresh_token_expires_at : (<Date>refreshTokenModel.expiresAt).getTime()};
    })
}

export async function renewAccessToken(refreshToken: string) {
    if (!refreshToken) {
        throw new Error('Refresh token needed to renew');
    }
    let refreshTokenModel: Document = await RefreshTokenSchema.findOne({refresh_token : refreshToken}).exec();
    if (!refreshTokenModel || refreshTokenModel.expiresAt.getTime() < new Date().getTime()) {
        throw new Error('Expired or revoked refresh token');
    }
    return {access_token: await jwtSign({user : refreshTokenModel.user_id}, SECRET, { expiresIn : ACCESS_TOKEN_LIFETIME}),
            access_token_expires_at : new Date(new Date().getTime() + ACCESS_TOKEN_LIFETIME_IN_MILLI).getTime()};
}
