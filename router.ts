import * as express from 'express';
import { count, signup, signupWithEmail, loginWithEmail, checkAvailability, read, login, renewAccessToken, findByIdAndUpdate} from './module';
import { OK } from 'http-status-codes';
import * as bodyParser  from 'body-parser';

let router = express.Router();
router.use(bodyParser.urlencoded({extended : false}));

var relativeURL = (relativeURL: string) : string => {
    return relativeURL;
}

router.use((req, res, next) => {
    res.locals.relativeURL = relativeURL = (relativeURL: string) => {
        return req.baseUrl + relativeURL;
    }
    next();    
});

router.param('user', async (req, res, next, id) => {
    try {
        req.object = await read(id);
        if (!req.object) {
            return next(new Error('No such user found'));
        }
        next();
    } catch (error) {
        next(error);
    }
})

router.get('/me', async(req, res, next) => {
    try {
        res.status(OK).send(req.user);
    } catch (error) {
        next(error);
    }
})

router.get('/check_availability', async (req, res, next) => {
    try {
        res.status(OK).send({available : await checkAvailability(req.query.username)});
    } catch (error) {
        next(error);
    }
})

router.post('/signup', async (req, res, next) => {
    try {
        res.status(OK).send(await signup(req.body.username, req.body.password));
    } catch(error) {
        next(error);
    }
})

router.post('/email_signup', async (req, res, next) => {
    try {
        res.status(OK).send(await signupWithEmail(req.body.email, req.body.password));
    } catch(error) {
        next(error);
    }
})

router.post('/email_login', async (req, res, next) => {
    try {
        res.status(OK).send(await loginWithEmail(req.body.email, req.body.password));
    } catch(error) {
        next(error);
    }
})

router.post('/login', async (req, res, next) => {
    try {
        res.status(OK).send(await login(req.body.username, req.body.password));
    } catch(error) {
        next(error);
    }
})

router.get('/:user', async (req, res, next) => {
    try {
        res.status(OK).send(req.object);
    } catch(error) {
        next(error);
    }
})

router.post('/token', async (req, res, next) => {
    try {
        res.status(OK).send(await renewAccessToken(req.body.refresh_token));
    } catch(error) {
        next(error);
    }
})

router.post('/device_token', async(req, res, next) => {
    try{
        res.status(OK).send(await findByIdAndUpdate(req.user.id, {$set : {device_token : req.body.device_token}}));
    } catch (error){
        next(error);
    }
});

export = router;