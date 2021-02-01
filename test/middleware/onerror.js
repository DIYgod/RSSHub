process.env.SENTRY = 'https://mock@mock.com/1';
process.env.SENTRY_ROUTE_TIMEOUT = '0';

const supertest = require('supertest');
jest.mock('request-promise-native');
const server = require('../../lib/index');
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
    });
});
