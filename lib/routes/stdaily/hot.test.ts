import { beforeEach, describe, expect, it, vi } from 'vitest';

const tryGet = vi.hoisted(() => vi.fn());
const ofetch = vi.hoisted(() => vi.fn());

vi.mock('@/utils/cache', () => ({
    default: {
        tryGet,
    },
}));

vi.mock('@/utils/ofetch', () => ({
    default: ofetch,
}));

describe('/stdaily/hot', () => {
    beforeEach(() => {
        tryGet.mockReset();
        ofetch.mockReset();
        tryGet.mockImplementation(async (_key, getter) => await getter());
    });

    it('builds feed items from the 热点 list page and article details', async () => {
        ofetch
            .mockResolvedValueOnce(`
                <div class="f_lieb_list">
                    <dl>
                        <h3><a href="https://www.stdaily.com/web/gdxw/2026-05/24/content_521741.html">First title</a></h3>
                        <dt><a href="https://www.stdaily.com/web/gdxw/2026-05/24/content_521741.html"><img src="/web/gdxw/pic/2026-05/24/521741.jpg"></a></dt>
                        <div class="sourthTime">
                            <span>Source One</span>
                            <i>|</i>
                            <span>2026-05-24 23:33:55</span>
                        </div>
                    </dl>
                    <dl>
                        <h3><a href="https://www.stdaily.com/web/gdxw/2026-05/24/content_521725.html">Second title</a></h3>
                        <dt><a href="https://www.stdaily.com/web/gdxw/2026-05/24/content_521725.html"><img src="https://www.stdaily.com/web/gdxw/pic/2026-05/24/521725.jpg"></a></dt>
                        <div class="sourthTime">
                            <span>Source Two</span>
                            <i>|</i>
                            <span>2026-05-24 20:40:24</span>
                        </div>
                    </dl>
                </div>
            `)
            .mockResolvedValueOnce(`
                <div class="articleHead">
                    <div class="time1">
                        2026-05-24 23:33:54
                        <span class="f_source">Source One</span>
                    </div>
                </div>
                <div class="pages_content">
                    <div class="content">
                        <div class="videoBox" style="display: none;"></div>
                        <p>First article body</p>
                    </div>
                </div>
            `)
            .mockResolvedValueOnce(`
                <div class="articleHead">
                    <div class="time1">
                        2026-05-24 20:40:24
                        <span class="f_source">Source Two</span>
                    </div>
                </div>
                <div class="pages_content">
                    <div class="content">
                        <p>Second article body</p>
                    </div>
                </div>
            `);

        const { route } = await import('@/routes/stdaily/hot');
        const data = await route.handler({} as any);

        expect(ofetch).toHaveBeenCalledWith('https://www.stdaily.com/web/rdxw/node_327.html');
        expect(tryGet).toHaveBeenCalledTimes(2);
        expect(tryGet).toHaveBeenNthCalledWith(1, 'https://www.stdaily.com/web/gdxw/2026-05/24/content_521741.html', expect.any(Function));
        expect(data.title).toBe('中国科技网 - 热点');
        expect(data.link).toBe('https://www.stdaily.com/web/rdxw/node_327.html');
        expect(data.item).toHaveLength(2);
        expect(data.item[0]).toMatchObject({
            title: 'First title',
            link: 'https://www.stdaily.com/web/gdxw/2026-05/24/content_521741.html',
            author: 'Source One',
            description: '<p>First article body</p>',
        });
        expect(data.item[0].pubDate).toBeDefined();
        expect(data.item[1]).toMatchObject({
            title: 'Second title',
            link: 'https://www.stdaily.com/web/gdxw/2026-05/24/content_521725.html',
            author: 'Source Two',
            description: '<p>Second article body</p>',
        });
    });
});
