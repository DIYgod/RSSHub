import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = {
    HEROKU_SLUG_COMMIT: process.env.HEROKU_SLUG_COMMIT,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
};

afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unmock('node:child_process');

    if (originalEnv.HEROKU_SLUG_COMMIT === undefined) {
        delete process.env.HEROKU_SLUG_COMMIT;
    } else {
        process.env.HEROKU_SLUG_COMMIT = originalEnv.HEROKU_SLUG_COMMIT;
    }
    if (originalEnv.VERCEL_GIT_COMMIT_SHA === undefined) {
        delete process.env.VERCEL_GIT_COMMIT_SHA;
    } else {
        process.env.VERCEL_GIT_COMMIT_SHA = originalEnv.VERCEL_GIT_COMMIT_SHA;
    }
});

describe('git-hash', () => {
    it('falls back to unknown when git commands fail', async () => {
        delete process.env.HEROKU_SLUG_COMMIT;
        delete process.env.VERCEL_GIT_COMMIT_SHA;

        vi.doMock('node:child_process', () => ({
            execSync: () => {
                throw new Error('git failure');
            },
        }));

        const { gitHash } = await import('@/utils/git-hash');
        expect(gitHash).toBe('unknown');
    });
});
