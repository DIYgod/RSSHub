import type { Context } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/onlyheaven/index';
import ofetch from '../lib/utils/ofetch';

vi.mock('../lib/utils/ofetch');

const ctx = (params: Record<string, string>) => ({ req: { param: () => params } }) as unknown as Context;
const imageKey = 'a'.repeat(64);
const secondImageKey = 'b'.repeat(64);

describe('onlyheaven route', () => {
    beforeEach(() => vi.resetAllMocks());

    it('uses the global posts API and distinguishes posts from different creators', async () => {
        vi.mocked(ofetch).mockResolvedValue({
            posts: [
                { id: '42', service: 'onlyfans', creatorId: '100001', creatorName: 'Creator One', title: 'Example post', captionHtml: '<p>Example content</p>', published: 1_750_000_000 },
                { id: '42', service: 'fansly', creatorId: '100002', creatorName: 'Creator Two', title: null, captionHtml: null, published: 1_750_000_100 },
            ],
        });

        const feed = await route.handler(ctx({ service: 'posts' }));

        expect(ofetch).toHaveBeenCalledExactlyOnceWith('https://cum.st/api/v1/posts');
        expect(feed).toMatchObject({
            link: 'https://cum.st/posts',
            item: [
                {
                    title: 'Example post',
                    author: 'Creator One',
                    description: '<p>Example content</p>',
                    pubDate: new Date(1_750_000_000_000),
                    link: 'https://cum.st/creators/onlyfans/100001/post/42',
                    guid: 'onlyheaven:onlyfans:100001:post:42',
                },
                { title: 'Post 42', author: 'Creator Two', description: '', link: 'https://cum.st/creators/fansly/100002/post/42', guid: 'onlyheaven:fansly:100002:post:42' },
            ],
        });
    });

    it('uses the creator DM API and omits dates that the DM feed does not provide', async () => {
        vi.mocked(ofetch).mockImplementation((url) =>
            Promise.resolve(String(url).endsWith('/profile') ? { name: 'example-creator', displayName: 'Creator One' } : { dms: [{ id: '300001', service: 'onlyfans', contentHtml: '<p>Example DM</p>' }] })
        );

        const feed = await route.handler(ctx({ service: 'onlyfans', id: '100001', type: 'dms' }));

        expect(ofetch).toHaveBeenCalledWith('https://cum.st/api/v1/onlyfans/user/100001/dms');
        expect(ofetch).toHaveBeenCalledWith('https://cum.st/api/v1/onlyfans/user/100001/profile');
        expect(feed).toMatchObject({
            link: 'https://cum.st/creators/onlyfans/100001/dms',
            item: [{ title: 'DM 300001', author: 'Creator One', description: '<p>Example DM</p>', link: 'https://cum.st/creators/onlyfans/100001/dm/300001', guid: 'onlyheaven:onlyfans:100001:dm:300001' }],
        });
        expect((feed as { item: Array<{ pubDate?: Date }> }).item[0].pubDate).toBeUndefined();
    });

    it('links creator posts using the creator page path when rows have no creator ID', async () => {
        vi.mocked(ofetch).mockImplementation((url) =>
            Promise.resolve(
                String(url).endsWith('/profile')
                    ? { name: 'example-creator', displayName: null }
                    : {
                          posts: [
                              {
                                  id: '200001',
                                  service: 'onlyfans',
                                  title: null,
                                  captionHtml: '<p>Example caption</p>',
                                  published: 1_750_000_000,
                                  attachments: [
                                      { locked: false, kind: 'image', storageKey: imageKey, variants: [{ name: 'original.jpg' }] },
                                      { locked: false, kind: 'image', storageKey: secondImageKey, variants: [{ name: 'original.png' }] },
                                      { locked: true, kind: 'image', storageKey: 'c'.repeat(64), variants: [{ name: 'original.jpg' }] },
                                  ],
                              },
                          ],
                      }
            )
        );

        const feed = await route.handler(ctx({ service: 'onlyfans', id: '100003' }));

        expect(ofetch).toHaveBeenCalledWith('https://cum.st/api/v1/onlyfans/user/100003/posts');
        expect(feed).toMatchObject({
            link: 'https://cum.st/creators/onlyfans/100003',
            item: [
                {
                    link: 'https://cum.st/creators/onlyfans/100003/post/200001',
                    description: `<p>Example caption</p><p><img src="https://e1.cum.st/media/${imageKey}/original.jpg"></p><p><img src="https://e1.cum.st/media/${secondImageKey}/original.png"></p>`,
                    image: `https://e1.cum.st/media/${imageKey}/original.jpg`,
                },
            ],
        });
    });

    it.each(['posts', 'dms'])('supports Patreon creator %s', async (kind) => {
        vi.mocked(ofetch).mockImplementation((url) =>
            Promise.resolve(
                String(url).endsWith('/profile')
                    ? { name: 'example-patreon', displayName: 'Patreon Creator' }
                    : kind === 'posts'
                      ? { posts: [{ id: '200002', service: 'patreon', title: 'Example post', captionHtml: '<p>Example content</p>', published: 1_750_000_000 }] }
                      : { dms: [{ id: '300002', service: 'patreon', contentHtml: '<p>Example DM</p>' }] }
            )
        );

        const feed = await route.handler(ctx({ service: 'patreon', id: '100004', ...(kind === 'dms' && { type: 'dms' }) }));

        expect(ofetch).toHaveBeenCalledWith(`https://cum.st/api/v1/patreon/user/100004/${kind}`);
        expect(ofetch).toHaveBeenCalledWith('https://cum.st/api/v1/patreon/user/100004/profile');
        expect(feed).toMatchObject({
            link: `https://cum.st/creators/patreon/100004${kind === 'dms' ? '/dms' : ''}`,
            item: [{ link: `https://cum.st/creators/patreon/100004/${kind === 'dms' ? 'dm/300002' : 'post/200002'}`, author: 'Patreon Creator' }],
        });
    });

    it('rejects incomplete or unsupported paths before requesting the API', async () => {
        await expect(route.handler(ctx({ service: 'onlyfans' }))).rejects.toThrow('Use /onlyheaven/posts');
        await expect(route.handler(ctx({ service: 'posts', id: '100001' }))).rejects.toThrow('Use /onlyheaven/posts');
        expect(ofetch).not.toHaveBeenCalled();
    });
});
