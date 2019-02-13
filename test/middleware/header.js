const supertest = require('supertest');
const { server } = require('../../lib/index');
const request = supertest(server);
const config = require('../../lib/config');

afterAll(() => {
    server.close();
});

describe('header', () => {
    it(`header`, async () => {
        const response = await request.get('/test/1');
        expect(response.headers['access-control-allow-origin']).toBe('*');
        expect(response.headers['access-control-allow-headers']).toBe('Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
        expect(response.headers['access-control-allow-methods']).toBe('GET');
        expect(response.headers['content-type']).toBe('application/xml; charset=utf-8');
        expect(response.headers['cache-control']).toBe(`max-age=${config.cacheExpire / 2}`);
    });
});
