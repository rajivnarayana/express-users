export const PORT = 7000;
export const BASE_URL = `http://localhost:${PORT}`;

import { decode } from "jsonwebtoken";
import { UsersModel as UserSchema } from 'users';
import * as app from "../../express-sample/app";
import { Server } from 'http';
import { Document, Types } from "mongoose";



// import { MongoClient } from 'mongodb';
let server : Server;

//Drop all the tables in database.
/*
function cleanDB() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(process.env.MONGO_URL, (err, db) => {
            if (err) {
                return reject(err);
            }
            var usersCollection = db.collection('users');
            usersCollection.createIndex({'username' : {unique : true}});
            usersCollection.drop();
            db.close();    
            resolve();
        });
        
    })
}
*/

export async function dropTables() {
    await UserSchema.remove({}).exec();
    return;
}

export function startServer() {
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            resolve();
        })    
    })
}

export function stopServer() {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                return reject(err);
            } 
            resolve();
        })
    })
}

export async function createUser(initialFieldsAndValues : any) : Promise<Document> {
    return await UserSchema.create(initialFieldsAndValues);
}    

/**
 * @param accessToken String Access token obtained from user login API.
 */
export function decodeUser(accessToken: string) {
    return decode(accessToken).user;
}