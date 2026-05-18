import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('pkg', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        delete process.env.IS_PACKAGE;
        delete process.env.UA;
    });

    it('requires init before request', async () => {
        const { request } = await import('./pkg');
        await expect(request('/test/1')).rejects.toThrow('RSSHub not initialized. Please call init() first.');
    });

    it('config', async () => {
        const { init } = await import('./pkg');
        await init({
            UA: 'mock',
        });
        const { config } = await import('./config');
        expect(config.ua).toBe('mock');
    });

    it('request', async () => {
        const { init, request } = await import('./pkg');
        await init();
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
            const { init, request } = await import('./pkg');
            await init();
            await request('/test/error');
        } catch (error) {
            expect(error).toBe('Error test');
        }
    });

    it('registerRoute adds custom routes and namespaces', async () => {
        const { init, registerRoute, request } = await import('./pkg');
        await init();

        await registerRoute(
            'custom',
            {
                path: '/hello',
                name: 'Custom Hello',
                handler: () => ({
                    title: 'Custom',
                    link: 'https://example.com',
                    item: [
                        {
                            title: 'Entry',
                            link: 'https://example.com/entry',
                        },
                    ],
                    allowEmpty: true,
                }),
            },
            {
                name: 'Custom Namespace',
                url: 'https://example.com',
                lang: 'en',
            }
        );

        const data = await request('/custom/hello');
        expect(data.title).toBe('Custom');

        const { namespaces } = await import('./registry');
        expect(namespaces.custom?.name).toBe('Custom Namespace');
        expect(namespaces.custom?.routes['/hello']).toBeDefined();
    });

    it('registerRoute supports handlers that return Response', async () => {
        const { init, registerRoute } = await import('./pkg');
        await init();

        await registerRoute('custom-response', {
            path: '/hello',
            name: 'Custom Response',
            handler: () => new Response('ok'),
        });

        const app = (await import('@/app')).default;
        const response = await app.request('/custom-response/hello');
        expect(await response.text()).toBe('ok');
    });
});
