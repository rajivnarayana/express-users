import {BASE_URL} from './utils';
import * as request from "request"

export function get(relativePath, options = {}) : Promise<{response: any, body: string}> {
    return new Promise((resolve, reject) => {
        request.get(BASE_URL+relativePath, options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            
            resolve({response, body});
        })
    })
}

export function post(relativePath, options?) : Promise<{response: any, body: string}>{
    let url = relativePath.startsWith('/') ? BASE_URL+relativePath : relativePath; 
    return new Promise((resolve, reject) => {
        request.post(url, options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            resolve({response, body});
        })
    });
}


export function put(relativePath: string, options?) : Promise<{response: any, body: string}>{
    let url = relativePath.startsWith('/') ? BASE_URL+relativePath : relativePath; 
    return new Promise((resolve, reject) => {
        request.put(url, options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            resolve({response, body});            
        })
    })
}

