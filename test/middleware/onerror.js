process.env.SENTRY = 'https://mock@mock.com/1';
process.env.SENTRY_ROUTE_TIMEOUT = '0';

const supertest = require('supertest');
jest.mock('request-promise-native');
const server = require('../../lib/index');
const config = require('../../lib/config').value;
const request = supertest(server);
const cheerio = require('cheerio');

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

describe('v2 route throws an error', () => {
    it('v2 route path error should have path mounted', async () => {
        await request.get('/test/error');
        await request.get('/thisDoesNotExist');
        const response = await request.get('/');

        const $ = cheerio.load(response.text);
        $('.debug-item').each((index, item) => {
            const key = $(item).find('.debug-key').text().trim();
            const value = $(item).find('.debug-value').html().trim();
            switch (key) {
                case 'Request Amount:':
                    expect(value).toBe('7');
                    break;
                case 'Hot Routes:':
                    expect(value).toBe('4  /test/:id<br>');
                    break;
                case 'Hot Paths:':
                    expect(value).toBe('2  /test/error<br>2  /test/slow<br>1  /test/httperror<br>1  /thisDoesNotExist<br>1  /<br>');
                    break;
                case 'Hot Error Routes:':
                    expect(value).toBe('3  /test/:id<br>');
                    break;
                case 'Hot Error Paths:':
                    expect(value).toBe('2  /test/error<br>1  /test/httperror<br>1  /test/slow<br>1  /thisDoesNotExist<br>');
                    break;
            }
        });
    });
});
