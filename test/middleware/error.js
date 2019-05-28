const supertest = require('supertest');
const { server } = require('../../lib/index');
const request = supertest(server);

afterAll(() => {
    server.close();
});

describe('error', () => {
    it(`error`, async () => {
        const response = await request.get('/test/0');
        expect(response.text).toMatch(/RSSHub 发生了一些意外: <pre>Error: Error test/);
    });
});
