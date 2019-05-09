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
        expect(response.headers['access-control-allow-origin']).toBe('127.0.0.1:1200');
        expect(response.headers['access-control-allow-methods']).toBe('GET');
        expect(response.headers['content-type']).toBe('application/xml; charset=utf-8');
        expect(response.headers['cache-control']).toBe(`public, max-age=${config.cache.routeExpire}`);
        expect(response.headers['last-modified']).toBe(response.text.match(/<lastBuildDate>(.*)<\/lastBuildDate>/)[1]);
        // expect(response.headers.etag).toBe('"b37-MORyrF0tJ8BFw0xLLZL/zBYAFPY"');
    });
});
