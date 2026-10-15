import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/post';

const rootUrl = 'https://vcb-s.com';
const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export const route: Route = {
    path: '/category/:cate',
    categories: ['anime'],
    example: '/vcb-s/category/works',
    parameters: { cate: '分类' },
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
            source: ['vcb-s.com/archives/category/:cate'],
        },
    ],
    name: '分类文章',
    maintainers: ['cxfksword'],
    handler,
    url: 'vcb-s.com/',
    description: `| 作品项目 | 科普系列 | 计划与日志 |
| -------- | -------- | ---------- |
| works    | kb       | planlog    |`,
};

async function handler(ctx) {
    const cate = ctx.req.param('cate');
    const limit = Math.min(getRouteLimit(ctx, 7), 100);

    const cateUrl = `${cateAPIUrl}?slug=${cate}`;
    const category = await cache.tryGet(cateUrl, async () => {
        const res = await got.get(cateUrl);
        return JSON.parse(res.body.trim())[0];
    });

    const url = `${postsAPIUrl}?categories=${category.id}&page=1&per_page=${limit}&_embed`;
    const response = await got.get(url);
    const data = JSON.parse(response.body.trim());

    const items = data.map((item) => {
        const description = renderDescription({
            post: item.content.rendered.replaceAll(/<pre class="js-medie-info-detail[^>]*>(.*?)<\/pre>/gs, '<pre><code>$1</code></pre>').replaceAll(/<div.+?dw-box-download[^>]+>(.*?)<\/div>/gs, '<pre>$1</pre>'),
            medias: item._embedded['wp:featuredmedia'],
        });

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parsePublicationDate(item.date_gmt),
            author: item._embedded.author[0].name,
        };
    });

    return {
        title: `${category.name} | VCB-Studio`,
        link: `${rootUrl}/archives/category/${category.slug}`,
        item: items,
    };
}

function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{1,3})?(?:Z|\+00:00)?$/.exec(value);
    if (!match || !Number.isFinite(parseDate(match[1], 'YYYY-MM-DDTHH:mm:ss', true).getTime())) {
        return;
    }
    const date = parseDate(value.endsWith('Z') || value.endsWith('+00:00') ? value : `${value}Z`);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
