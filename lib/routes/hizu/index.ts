import { load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const titles = {
    '5dd92265e4b0bf88dd8c1175': '热点',
    '5dd921a7e4b0bf88dd8c116f': '订阅',
    '604f1cbbe4b0cf5c2234d470': '学党史',
    '5dd92242e4b0bf88dd8c1174': '政经',
    '61259fd6e4b0d294f7f9786d': '合作区',
    '61dfe511e4b0248b60d1c568': '名记名播',
    '5dd9222ce4b0bf88dd8c1173': '大湾区',
    '617805e4e4b037abacfd4820': '网评',
    '5dd9220de4b0bf88dd8c1172': 'TV新闻',
    '5e6edd50e4b02ebde0ab061e': '音频',
    '600e8ad4e4b02c3a6af6aaa8': '澳门',
    '600f760fe4b0e33cf6f8e68e': '政务',
    '5ff7c0fde4b0e2f210d05e20': '教育',
    '5fc88615e4b0e3055e693e0a': '深圳',
    '600e8a93e4b02c3a6af6aa80': '中山',
    '5dd921ece4b0bf88dd8c1170': '民生',
    '61148184e4b08d3215364396': '社区',
    '5dd9215fe4b0bf88dd8c116b': '专题',
    '5e2e5107e4b0c14b5d0e3d04': '战疫',
    '5f88eaf2e4b0a27cd404e09e': '横琴',
    '5f86a3f5e4b09d75f99dde7d': '香洲',
    '5e8c42b4e4b0347c7e5836e0': '金湾',
    '5ee70534e4b07b8a779a1ad6': '斗门',
    '607d37ade4b05c59ac2f3d40': '高新',
};

export const route: Route = {
    path: '/:column?',
    categories: ['new-media'],
    example: '/hizu',
    parameters: { column: '栏目，见下表，默认为热点' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hizh.cn/'],
        },
    ],
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    url: 'hizh.cn/',
    description: `| 分类     | 编号                     |
| -------- | ------------------------ |
| 热点     | 5dd92265e4b0bf88dd8c1175 |
| 订阅     | 5dd921a7e4b0bf88dd8c116f |
| 学党史   | 604f1cbbe4b0cf5c2234d470 |
| 政经     | 5dd92242e4b0bf88dd8c1174 |
| 合作区   | 61259fd6e4b0d294f7f9786d |
| 名记名播 | 61dfe511e4b0248b60d1c568 |
| 大湾区   | 5dd9222ce4b0bf88dd8c1173 |
| 网评     | 617805e4e4b037abacfd4820 |
| TV 新闻  | 5dd9220de4b0bf88dd8c1172 |
| 音频     | 5e6edd50e4b02ebde0ab061e |
| 澳门     | 600e8ad4e4b02c3a6af6aaa8 |
| 政务     | 600f760fe4b0e33cf6f8e68e |
| 教育     | 5ff7c0fde4b0e2f210d05e20 |
| 深圳     | 5fc88615e4b0e3055e693e0a |
| 中山     | 600e8a93e4b02c3a6af6aa80 |
| 民生     | 5dd921ece4b0bf88dd8c1170 |
| 社区     | 61148184e4b08d3215364396 |
| 专题     | 5dd9215fe4b0bf88dd8c116b |
| 战疫     | 5e2e5107e4b0c14b5d0e3d04 |
| 横琴     | 5f88eaf2e4b0a27cd404e09e |
| 香洲     | 5f86a3f5e4b09d75f99dde7d |
| 金湾     | 5e8c42b4e4b0347c7e5836e0 |
| 斗门     | 5ee70534e4b07b8a779a1ad6 |
| 高新     | 607d37ade4b05c59ac2f3d40 |`,
};

function parseUpdatedDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function handler(ctx) {
    const column = ctx.req.param('column') ?? '5dd92265e4b0bf88dd8c1175';

    const rootUrl = 'https://www.hizh.cn';
    const currentUrl = `${rootUrl}/channels/zjyapp/columns/${column}/stories.json`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const limit = getRouteLimit(ctx, 50);
    let items = response.data.stories.slice(0, Math.max(50, limit)).map((item) => ({
        title: item.title,
        author: item.author,
        updated: parseUpdatedDate(item.updated),
        link: item.jsonUrl,
        category: item.columnName,
        pubDate: item.published ? parseDate(item.published) : undefined,
    }));

    if (ctx.req.query('sorted') !== 'false' && items.every((item) => Number.isFinite(item.pubDate?.getTime()))) {
        items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
        items = items.slice(0, limit);
    } else if (ctx.req.query('sorted') === 'false') {
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        async (item: (typeof items)[number]) => {
            const description = await cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const data = detailResponse.data;
                if (!data.content && data.mediaStream?.url && data.storyType === 'VIDEO') {
                    const poster = data.coverImages?.[0]?.url;
                    const summary = data.summary ? html`<p>${data.summary}</p>` : '';
                    return String(html`<video controls src="${data.mediaStream.url}" poster="${poster}"></video>${summary}`);
                }
                if (!data.content && data.mediaStream?.url && data.storyType === 'AUDIO') {
                    const coverUrl = data.coverImages?.[0]?.url;
                    const cover = coverUrl ? html`<img src="${coverUrl}" />` : '';
                    const summary = data.summary ? html`<p>${data.summary}</p>` : '';
                    return String(html`${cover}<audio controls src="${data.mediaStream.url}"></audio>${summary}`);
                }
                if (!data.content && data.storyType === 'HREF' && data.originUrl?.startsWith('https://mp.weixin.qq.com/')) {
                    const article = await got(data.originUrl);
                    const $ = load(article.data);
                    const main = $('#js_content');
                    main.find('img[data-src]').each((_, image) => {
                        $(image).attr('src', $(image).attr('data-src')!);
                    });
                    return main.html() ?? undefined;
                }
                const content = load(data.content);
                return content.html();
            });
            return { ...item, description, link: `${rootUrl}/content.html?jsonUrl=${item.link}` };
        },
        { concurrency: 3 }
    );

    return {
        title: `${titles[column]} - 珠海网`,
        link: rootUrl,
        item: items,
    };
}
