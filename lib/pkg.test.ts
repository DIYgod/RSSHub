import { describe, expect, it } from 'vitest';

import { init, request } from './pkg';

describe('pkg', () => {
    it('config', async () => {
        await init({
            UA: 'mock',
        });
        const { config } = await import('./config');
        expect(config.ua).toBe('mock');
    });

    it('request', async () => {
        const data = await request('/test/1');
        expect(data).toMatchObject({
            atomlink: 'http://localhost/test/1',
            title: 'Test 1',
            itunes_author: null,
            link: 'https://github.com/DIYgod/RSSHub',
            item: [
                {
                    title: 'Title1',
                    description: 'Description1',
                    pubDate: 'Mon, 31 Dec 2018 15:59:50 GMT',
                    link: 'https://github.com/DIYgod/RSSHub/issues/1',
                    author: 'DIYgod1',
                },
                {
                    title: 'Title2',
                    description: 'Description2',
                    pubDate: 'Mon, 31 Dec 2018 15:59:40 GMT',
                    link: 'https://github.com/DIYgod/RSSHub/issues/2',
                    author: 'DIYgod2',
                },
                {
                    title: 'Title3',
                    description: 'Description3',
                    pubDate: 'Mon, 31 Dec 2018 15:59:30 GMT',
                    link: 'https://github.com/DIYgod/RSSHub/issues/3',
                    author: 'DIYgod3',
                },
                {
                    title: 'Title4',
                    description: 'Description4',
                    pubDate: 'Mon, 31 Dec 2018 15:59:20 GMT',
                    link: 'https://github.com/DIYgod/RSSHub/issues/4',
                    author: 'DIYgod4',
                },
                {
                    title: 'Title5',
                    description: 'Description5',
                    pubDate: 'Mon, 31 Dec 2018 15:59:10 GMT',
                    link: 'https://github.com/DIYgod/RSSHub/issues/5',
                    author: 'DIYgod5',
                },
            ],
            allowEmpty: false,
        });
    });

    it('error', async () => {
        try {
            await request('/test/error');
        } catch (error) {
            expect(error).toBe('Error test');
        }
    });
});
