process.env.NODE_NAME = 'mock';

const supertest = require('supertest');
jest.mock('request-promise-native');
const server = require('../../lib/index');
const request = supertest(server);
const cheerio = require('cheerio');
let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
}

afterAll(() => {
    server.close();
});

describe('debug', () => {
    it('debug', async () => {
        const response1 = await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        const etag = response1.headers.etag;
        await request.get('/test/1').set('If-None-Match', etag).set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.234');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.234');
        await request.get('/test/empty').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/empty').set('X-Forwarded-For', '233.233.233.234');

        const response = await request.get('/').set('X-Forwarded-For', '233.233.233.233');

        const $ = cheerio.load(response.text);
        $('.debug-item').each((index, item) => {
            const key = $(item).find('.debug-key').html().trim();
            const value = $(item).find('.debug-value').html().trim();
            switch (key) {
                case 'Node Name:':
                    expect(value).toBe('mock');
                    break;
                case 'Git Hash:':
                    expect(value).toBe(gitHash);
                    break;
                case 'Request Amount:':
                    expect(value).toBe('8');
                    break;
                case 'ETag Matched:':
                    expect(value).toBe('1');
                    break;
                case 'Hot Routes:':
                    expect(value).toBe('3  /test/:id<br>');
                    break;
                case 'Hot Paths:':
                    expect(value).toBe('3  /test/1<br>2  /test/2<br>2  /test/empty<br>1  /<br>');
                    break;
                case 'Hot Error Routes:':
                    expect(value).toBe('1  /test/:id<br>');
                    break;
                case 'Hot Error Paths:':
                    expect(value).toBe('2  /test/empty<br>');
                    break;
            }
        });
    });
});
