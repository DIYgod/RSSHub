process.env.NODE_NAME = 'mock';

const supertest = require('supertest');
const { server } = require('../../lib/index');
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
    it(`debug`, async () => {
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/1').set('X-Forwarded-For', '233.233.233.234');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.233');
        await request.get('/test/2').set('X-Forwarded-For', '233.233.233.234');

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
                case '节点名:':
                    expect(value).toBe('mock');
                    break;
                case 'git hash:':
                    expect(value).toBe(gitHash);
                    break;
                case '请求数:':
                    expect(value).toBe('6');
                    break;
                case '热门路由:':
                    expect(value).toBe(`5&nbsp;&nbsp;/test/:id<br>`);
                    break;
                case '热门路径:':
                    expect(value).toBe(`3&nbsp;&nbsp;/test/1<br>2&nbsp;&nbsp;/test/2<br>1&nbsp;&nbsp;/<br>`);
                    break;
                case '热门IP:':
                    expect(value).toBe(`4&nbsp;&nbsp;233.233.233.233<br>2&nbsp;&nbsp;233.233.233.234<br>`);
                    break;
            }
        });
    });
});
