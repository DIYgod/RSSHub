import { describe, expect, it, afterAll, jest, afterEach } from '@jest/globals';
import supertest from 'supertest';

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
        const request = supertest((await import('@/index')).default);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/RE2JSSyntaxException/);
    });

    it(`filter Regexp engine backward compatibility`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'regexp';

        const request = supertest((await import('@/index')).default);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(200);
    });

    it(`filter Regexp engine test config`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'somethingelse';

        const request = supertest((await import('@/index')).default);

        const response = await request.get('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(response.text).toMatch(/somethingelse/);
    });
});
