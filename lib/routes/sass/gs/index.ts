import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const campusGot = got.extend({ allowH2: false });

const host = 'https://gs.sass.org.cn';
export const route: Route = {
    path: '/gs/:type',
    categories: ['university'],
    example: '/sass/gs/1793',
    parameters: { type: '类别 ID，见下表，其他未列出的栏目参数可以从页面的 URL Path 中找到，例如：硕士统考招生的网址为 `https://gs.sass.org.cn/1793/list.htm`，则类别 ID 为`1793`' },
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
            source: ['gs.sass.org.cn/:type/list.htm'],
        },
    ],
    name: '研究生院',
    maintainers: ['yanbot-team'],
    handler,
    description: `| 硕士统考招生 | 硕士推免招生 |
| ------------ | ------------ |
| 1793         | sstmzs       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `${host}/${type}/list.htm`;

    const response = await campusGot(url);

    const $ = load(response.data);
    const list = $('.column-news-list .cols_list .cols');
    const items = await pMap(
        list.toArray(),
        (item) => {
            const $children = $(item).children();
            const itemDate = $children.eq(1).text();
            const $titleLink = $children.eq(0).children().first();
            const path = $titleLink.attr('href')!;
            const itemTitle = $titleLink.attr('title')!;

            const itemUrl = path.startsWith('http') ? path : host + path;
            return cache.tryGet(itemUrl, async () => {
                const result = await campusGot(itemUrl);
                const $ = load(result.data);
                const body = $('.read .wp_articlecontent');
                if (!body.length) {
                    throw new Error('Sass article body is missing');
                }
                body.find('[pdfsrc]').each((_, el) => {
                    const pdf = $(el);
                    const path = pdf.attr('pdfsrc');
                    if (!path) {
                        return;
                    }
                    const url = new URL(path, itemUrl);
                    const label = pdf.attr('sudyfile-attr')?.match(/'title':'([^']+)'/)?.[1] ?? url.pathname.split('/').pop();
                    pdf.replaceWith(
                        $('<a></a>')
                            .attr('href', url.href)
                            .text(label ?? url.href)
                    );
                });
                const description = body.html();
                return {
                    title: itemTitle,
                    link: itemUrl,
                    description,
                    pubDate: itemDate ? parseDate(`${itemDate.trim()}T00:00:00Z`) : undefined,
                };
            });
        },
        { concurrency: 3 }
    );
    // Return the feed.
    return {
        title: '上海社会科学院 - 研究生院',
        link: url,
        description: '上海社会科学院 - 研究生院',
        item: items,
    };
}
