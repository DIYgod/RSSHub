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
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.234');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.234');
        await request.get('/test/empty').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/empty').set('X-Forwarded-For', '233.233.233.234');

        const response = await request.get('/').set('X-Forwarded-For', '233.233.233.233');

        const $ = cheerio.load(response.text);
        $('.debug-item').each((index, item) => {
            const key = $(item)
                .find('.debug-key')
                .html()
                .trim();
            const value = $(item)
                .find('.debug-value')
                .html()
                .trim();
            switch (key) {
                case 'node name:':
                    expect(value).toBe('mock');
                    break;
                case 'git hash:':
                    expect(value).toBe(gitHash);
                    break;
                case 'request amount:':
                    expect(value).toBe('8');
                    break;
                case 'hot routes:':
                    expect(value).toBe('4  undefined<br>3  /test/:id<br>');
                    break;
                case 'hot paths:':
                    expect(value).toBe('3  /test/1<br>2  /test/2<br>2  /test/empty<br>1  /<br>');
                    break;
                case 'hot IP:':
                    expect(value).toBe('5  233.233.233.233<br>3  233.233.233.234<br>');
                    break;
                case 'hot error routes:':
                    expect(value).toBe('1  /test/:id<br>1  undefined<br>');
                    break;
                case 'hot error paths:':
                    expect(value).toBe('2  /test/empty<br>');
                    break;
            }
        });
    });
});
