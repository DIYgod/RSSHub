import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { AMUCSITE_ROOT, fetchAmucsiteArticle, fetchHxcbArticle, paperNames, resolveHxcbNodeUrl } from './utils';

export const route: Route = {
    path: '/epaper/:id?',
    categories: ['traditional-media'],
    example: '/xmnn/epaper/xmrb',
    parameters: {
        id: {
            description: '报纸 id，见下表，默认为 `xmrb`，即厦门日报',
            default: 'xmrb',
            options: [
                { value: 'xmrb', label: '厦门日报' },
                { value: 'xmwb', label: '厦门晚报' },
                { value: 'csjb', label: '城市捷报' },
                { value: 'syzk', label: '双语周刊' },
                { value: 'hxcb', label: '海西晨报' },
            ],
        },
    },
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
            source: ['epaper.xmrb.com/:id/pc/col/index.html'],
            target: '/epaper/:id',
        },
        {
            source: ['dzb.sunnews.cn/'],
            target: '/epaper/hxcb',
        },
    ],
    name: '数字报',
    maintainers: ['nczitzk'],
    handler,
    description: `| 厦门日报 | 厦门晚报 | 城市捷报 | 双语周刊 | 海西晨报 |
| -------- | -------- | -------- | -------- | -------- |
| xmrb     | xmwb     | csjb     | syzk     | hxcb     |

::: tip
厦门日报、厦门晚报、城市捷报、双语周刊来自 \`epaper.xmrb.com\`，海西晨报来自 \`dzb.sunnews.cn\`。
:::`,
};

function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id') ?? 'xmrb';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string) : 80;

    if (id === 'hxcb') {
        return fetchHxcbArticles(limit);
    }
    if (['xmrb', 'xmwb', 'csjb', 'syzk'].includes(id)) {
        return fetchAmucsiteArticles(id, limit);
    }
    throw new Error(`Unsupported paper id: ${id}. Supported ids: xmrb, xmwb, csjb, syzk, hxcb`);
}

// Amucsite system: xmrb / xmwb on epaper.xmrb.com
async function fetchAmucsiteArticles(id: string, limit: number): Promise<Data> {
    const listUrl = `${AMUCSITE_ROOT}/${id}/pc/col/index.html`;
    const listHtml = await ofetch(listUrl, { responseType: 'text' });
    const $list = load(listHtml);

    // Collect version page URLs from the list page
    const versionUrls: string[] = [];
    $list('ul#list > li > a').each((_, el) => {
        const href = $list(el).attr('href');
        if (href) {
            versionUrls.push(new URL(href, listUrl).href);
        }
    });

    if (versionUrls.length === 0) {
        throw new Error(`No version links found on ${listUrl}`);
    }

    // Fetch all version pages in parallel to collect article links
    const versionResponses = await Promise.all(
        versionUrls.map(async (url) => ({
            url,
            html: await ofetch(url, { responseType: 'text' }),
        }))
    );

    const articleLinks: string[] = [];
    for (const { url, html } of versionResponses) {
        const $v = load(html);
        $v('ul.newsList#articlelist > li > a').each((_, el) => {
            const href = $v(el).attr('href');
            if (href) {
                // Resolve relative to the version page URL (hrefs like ../../../con/.../content_*.html)
                const absolute = new URL(href, url).href;
                if (!articleLinks.includes(absolute)) {
                    articleLinks.push(absolute);
                }
            }
        });
    }

    const paperName = paperNames[id] ?? id;
    const items = await Promise.all(articleLinks.slice(0, limit).map((link) => cache.tryGet(`xmnn:amucsite:${link}`, () => fetchAmucsiteArticle(link))));

    return {
        title: `${paperName}数字报`,
        link: listUrl,
        item: items,
    };
}

// Hxcb system: 海西晨报 on dzb.sunnews.cn
async function fetchHxcbArticles(limit: number): Promise<Data> {
    const nodeUrl = await resolveHxcbNodeUrl();
    const nodeHtml = await ofetch(nodeUrl, { responseType: 'text' });
    const $node = load(nodeHtml);

    // Collect article links from all ul.titss blocks (each block is one version)
    const articleLinks: string[] = [];
    $node('ul.titss > li > div > a').each((_, el) => {
        const href = $node(el).attr('href');
        if (href) {
            // Drop the ?div=-1 query string, keep the canonical content URL
            const path = href.split('?', 1)[0];
            const absolute = new URL(path, nodeUrl).href;
            if (!articleLinks.includes(absolute)) {
                articleLinks.push(absolute);
            }
        }
    });

    if (articleLinks.length === 0) {
        throw new Error(`No article links found on ${nodeUrl}`);
    }

    const items = await Promise.all(articleLinks.slice(0, limit).map((link) => cache.tryGet(`xmnn:hxcb:${link}`, () => fetchHxcbArticle(link))));

    return {
        title: '海西晨报数字报',
        link: nodeUrl,
        item: items,
    };
}
