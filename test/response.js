const supertest = require('supertest');
const app = require('../lib/index');
const request = supertest(app.callback());

const cases = require('./cases.json');
const statusCheck = require('./rules/status');
const check = require('./rules/index');

describe('response', () => {
    cases.text.forEach((url) => {
        it(`GET ${url}`, async () => {
            const response = await request.get(url);
            statusCheck(response);
        });
    });

    cases.rss.forEach((url) => {
        it(`GET ${url}`, async () => {
            const response = await request.get(url);
            await check(response);
        });
    });
});
