process.env.SENTRY = 'https://mock@mock.com/1';
process.env.SENTRY_ROUTE_TIMEOUT = '0';

const supertest = require('supertest');
jest.mock('request-promise-native');
const server = require('../../lib/index');
const config = require('../../lib/config').value;
const request = supertest(server);

afterAll(() => {
    server.close();
});

afterAll(() => {
    delete process.env.SENTRY;
    delete process.env.SENTRY_ROUTE_TIMEOUT;
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
    }, 20000);
});

describe('RequestInProgressError', () => {
    it(`RequestInProgressError`, async () => {
        const responses = await Promise.all([request.get('/test/slow'), request.get('/test/slow')]);
        expect(new Set(responses.map((r) => r.status))).toEqual(new Set([200, 503]));
        expect(new Set(responses.map((r) => r.headers['cache-control']))).toEqual(new Set([`public, max-age=${config.cache.requestTimeout}`, `public, max-age=${config.cache.routeExpire}`]));
        expect(responses.filter((r) => r.text.includes('This path is currently fetching, please come back later!'))).toHaveLength(1);
    });
});
