import * as router from './router';
import { read, verify } from './module';
export async function authenticate (req, res, next) {
    if (req.query.access_token) {
        try {
            let payload : {user: string} = await verify(req.query.access_token);
            let user = await read(payload.user);
            if (!user) {
                return next('No such user exists!');
            } else {
                req.user = user;
                next();
            }
        } catch (error) {
            return next(new Error('Invalid or expired token'));
        }
    } else {
        next();
    }
}

export * from './module';

export default router;