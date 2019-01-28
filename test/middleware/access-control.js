const supertest = require('supertest');
const Parser = require('rss-parser');
const parser = new Parser();
let server;

async function checkBlock(response) {
    expect(response.status).toBe(403);
    expect(await parser.parseString(response.text)).toMatchObject({
        items: [],
        title: '没有访问权限. Access denied.',
    });
}

afterEach(() => {
    process.env.BLACKLIST = undefined;
    server.close();
});

describe('access-control', () => {
    it(`blacklist`, async () => {
        process.env.BLACKLIST = '/test/1,/test/2,233.233.233.233';
        server = require('../../lib/index').server;
        const request = supertest(server);

        const response1 = await request.get('/test/1');
        checkBlock(response1);

        const response2 = await request.get('/test/2');
        checkBlock(response2);

        const response31 = await request.get('/test/3');
        expect(response31.status).toBe(200);

        const response32 = await request.get('/test/3').set('X-Forwarded-For', '233.233.233.233');
        checkBlock(response32);
    });
});
