const supertest = require('supertest');
let server;
jest.mock('request-promise-native');

async function checkBlock(response) {
    expect(response.status).toBe(403);
    expect(response.text).toMatch(/Access denied\./);
}

afterEach(() => {
    delete process.env.ACCESS_KEY;
    delete process.env.BLACKLIST;
    delete process.env.WHITELIST;
    jest.resetModules();
    server.close();
});

describe('access-control', () => {
    it(`blacklist`, async () => {
        process.env.BLACKLIST = '/test/1,233.233.233.233';
        process.env.ACCESS_KEY = '1L0veRSSHub';
        server = require('../../lib/index');
        const request = supertest(server);

        const response11 = await request.get('/test/1');
        checkBlock(response11);

        const response12 = await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        checkBlock(response12);

        const response21 = await request.get('/test/2');
        expect(response21.status).toBe(200);

        const response22 = await request.get('/test/2').set('X-Forwarded-For', '233.233.233.233');
        checkBlock(response22);

        // wrong key, not on blacklist
        const response31 = await request.get('/test/2?key=MeL0veRSSHub');
        expect(response31.status).toBe(200);

        // wrong key, on blacklist
        const response32 = await request.get('/test/2?key=MeL0veRSSHub').set('X-Forwarded-For', '233.233.233.233');
        checkBlock(response32);

        // right key, on blacklist
        const response33 = await request.get('/test/2?key=1L0veRSSHub').set('X-Forwarded-For', '233.233.233.233');
        expect(response33.status).toBe(200);
    });

    it(`whitelist`, async () => {
        process.env.WHITELIST = '/test/1,233.233.233.233';
        process.env.ACCESS_KEY = '1L0veRSSHub';
        server = require('../../lib/index');
        const request = supertest(server);

        const response11 = await request.get('/test/1');
        expect(response11.status).toBe(200);

        const response12 = await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        expect(response12.status).toBe(200);

        const response21 = await request.get('/test/2');
        checkBlock(response21);

        const response22 = await request.get('/test/2').set('X-Forwarded-For', '233.233.233.233');
        expect(response22.status).toBe(200);

        // wrong key, not on whitelist
        const response31 = await request.get('/test/2?key=MeL0veRSSHub');
        checkBlock(response31);

        // wrong key, on whitelist
        const response32 = await request.get('/test/2?key=MeL0veRSSHub').set('X-Forwarded-For', '233.233.233.233');
        expect(response32.status).toBe(200);

        // right key
        const response33 = await request.get('/test/2?key=1L0veRSSHub');
        expect(response33.status).toBe(200);
    });
});
