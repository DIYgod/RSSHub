import { describe, expect, it, afterAll, jest, afterEach } from '@jest/globals';

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
        const app = (await import('@/app')).default;

        const response = await app.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(await response.text()).toMatch(/RE2JSSyntaxException/);
    });

    it(`filter Regexp engine backward compatibility`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'regexp';

        const app = (await import('@/app')).default;

        const response = await app.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(200);
    });

    it(`filter Regexp engine test config`, async () => {
        process.env.FILTER_REGEX_ENGINE = 'somethingelse';

        const app = (await import('@/app')).default;

        const response = await app.request('/test/1?filter=abc(%3F%3Ddef)');
        expect(response.status).toBe(404);
        expect(await response.text()).toMatch(/somethingelse/);
    });
});
