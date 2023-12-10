const supertest = require('supertest');
const server = require('../lib/index');
const request = supertest(server);

afterAll(() => {
    server.close();
});

describe('index', () => {
    it('serve logo', async () => {
        const response = await request.get('/logo.png');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('image/png');
        expect(response.headers['content-length']).toBe('89034');
    });
});
