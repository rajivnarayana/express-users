import { startServer, stopServer, dropTables} from './utils';
import { get, post } from './request-promise';

describe("Login", () => {

    beforeAll(async (done) => {
        await startServer();
        await dropTables();
        done();
    })
    
    afterAll( async (done) => {
        await stopServer();
        done();
    })
    
    var accessToken;
    var refreshToken;
    var refreshTokenExpiresIn;
    
    
    xit("Sign up First time", async (done) => {
        let { response, body} = await post('/users/signup', {form: {username: 'john', password: 'hello123'}});
        expect(response.statusCode).toBe(200);
        let json = JSON.parse(body);
        accessToken = json.access_token;
        refreshToken = json.refresh_token;
        refreshTokenExpiresIn = json.refresh_token_expires_in;
        done();
    })
    
    xit('Sign up second time as same user should error out', async (done) => {
        let { response, body} = await post('/users/signup', {form: {username: 'john', password: 'hello123'}});
        expect(response.statusCode).toBe(500);
        done();
    })
    
    xit('Accessing /me should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token='+accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.username).toBe('john');
        done();
    })
    
    xit('Login should generate a new access token and refresh token', async (done) => {
        let { response, body} = await post('/users/login', {form: {username: 'john', password: 'hello123'}});
        let json = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(json.access_token).not.toBeNull();
        accessToken = json.access_token;
        expect(json.refresh_token).not.toBeNull();
        refreshToken = json.refresh_token;
        expect(json.refresh_token_expires_in).not.toBeNull();
        refreshTokenExpiresIn = json.refresh_token_expires_in;
        done();
    })
    
    xit('Accessing /me with new token should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token='+accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.username).toBe('john');
        done();
    })
    
    
    xit('Accessing /me after refreshing token should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token='+accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.username).toBe('john');
        done();
    })  

    it("Sign up with email for the first time", async (done) => {
        let { response, body} = await post('/users/email_signup', {form: {email: 'john@webileapps.com', password: 'hello123'}});
        expect(response.statusCode).toBe(200);
        let json = JSON.parse(body);
        accessToken = json.access_token;
        refreshToken = json.refresh_token;
        refreshTokenExpiresIn = json.refresh_token_expires_in;
        done();
    })
    
    it('Sign up second time as same user should error out', async (done) => {
        let { response, body} = await post('/users/email_signup', {form: {email: 'john@webileapps.com', password: 'hello123'}});
        expect(response.statusCode).toBe(500);
        done();
    })    

    it('Accessing /me should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token=' + accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.email).toBe('john@webileapps.com');
        done();
    })    

    it('Login should generate a new access token and refresh token', async (done) => {
        let { response, body} = await post('/users/token', {form: {refresh_token: refreshToken}});
        let json = JSON.parse(body);
        expect(response.statusCode).toBe(200);
        expect(json.access_token).not.toBeNull();
        accessToken = json.access_token;
        done();
    });

    it('Accessing /me with new token should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token=' + accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.email).toBe('john@webileapps.com');
        done();
    })  

    it('Accessing /me after refreshing token should show my name', async (done) => {
        let { response, body } = await get('/users/me?access_token=' + accessToken);
        expect(response.statusCode).toBe(200);
        let user = JSON.parse(body);
        expect(user.email).toBe('john@webileapps.com');
        done();
    })   
})