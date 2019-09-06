const supertest = require('supertest');
const { server } = require('../../lib/index');
const request = supertest(server);

beforeAll(() => {
    process.env.SENTRY = 'test';
    process.env.NODE_NAME = 'test';
});

afterAll(() => {
    delete process.env.SENTRY;
    delete process.env.NODE_NAME;
    server.close();
});

describe('error', () => {
    it(`error`, async () => {
        const response = await request.get('/test/error');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/Error: Error test/);
    });
});

describe('httperror', () => {
    it(`httperror`, async () => {
        const response = await request.get('/test/httperror');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(
            /Response code 404 \(Not Found\): target website might be blocking our access, you can <a href="https:\/\/docs\.rsshub\.app\/install\/">host your own RSSHub instance<\/a> for a better usability\./
        );
    });
});
