const supertest = require('supertest');
jest.mock('request-promise-native');
jest.setTimeout(50000);

afterAll(() => {
    delete process.env.FILTER_REGEX_ENGINE;
});

afterEach(() => {
    delete process.env.FILTER_REGEX_ENGINE;
    jest.resetModules();
});

describe('filter-engine', () => {
    it(`filter RE2 engine ReDoS attack`, async () => {
        const server = require('../../lib/index');
        const request = supertest(server);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/SyntaxError/);
        server.close();
    });

    it(`filter Regexp engine backward compatibility`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'regexp';

        const server = require('../../lib/index');
        const request = supertest(server);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(200);
        server.close();
    });

    it(`filter Regexp engine test config`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'somethingelse';

        const server = require('../../lib/index');
        const request = supertest(server);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/somethingelse/);
        server.close();
    });
});
