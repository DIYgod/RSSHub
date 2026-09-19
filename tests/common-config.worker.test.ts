import { afterEach, expect, it, vi } from 'vitest';

import { route } from '../lib/routes/gov/zhengce/zhengceku';
import type { Data, Route } from '../lib/types';
import buildData from '../lib/utils/common-config';

// These unused network/devtools exports are tree-shaken in the production bundle.
vi.mock('undici', () => ({}));
vi.mock('node-network-devtools', () => ({ register: vi.fn() }));
vi.mock('../lib/config', () => ({ config: { requestRetry: 0, loggerLevel: 'error' } }));

afterEach(() => vi.unstubAllGlobals());

it('extracts the policy library in workerd with page/item callbacks and dates', async () => {
    const fetchMock = vi.fn(() =>
        Promise.resolve(
            new Response(
                '<div class="channel_tab"><div class="noline"><a>部门文件</a></div></div><div class="news_box"><div class="list"><ul><li><h4><a href="/policy">政策</a><span class="date">2025-01-01</span></h4></li></ul></div></div>',
                { headers: { 'content-type': 'text/html' } }
            )
        )
    );
    vi.stubGlobal('fetch', fetchMock);
    const data = (await (route.handler as Exclude<Route['handler'], string>)({ req: { param: () => 'bmwj' } } as never)) as Data;
    expect(data.title).toBe('部门文件 - 政府文件库');
    expect(data.item).toEqual([{ title: '政策', link: '/policy', pubDate: new Date('2025-01-01T00:00:00Z'), description: undefined, guid: undefined }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('treats JavaScript-looking text and percent signs as literal data in workerd', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(new Response('<li><a>100% growth %remaining%</a></li>', { headers: { 'content-type': 'text/html' } })))
    );
    const title = `$('a').text(); globalThis.shouldNotRun = true`;
    const result = await buildData({ url: 'https://example.test/', title, item: { item: 'li', title: ($) => $('a').text() } });
    expect(result.title).toBe(title);
    expect(result.item[0].title).toBe('100% growth %remaining%');
    expect(Reflect.has(globalThis, 'shouldNotRun')).toBe(false);
});
