import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const limit = ctx.req.query('limit') ?? 7;

    const cateUrl = `${cateAPIUrl}?slug=${cate}`;
    const category = await cache.tryGet(cateUrl, async () => {
        const res = await got.get(cateUrl);

        if (typeof res.data === 'string') {
            res.data = JSON.parse(res.body.trim());
        }
        return res.data[0];
    });

    const url = `${postsAPIUrl}?categories=${category.id}&page=1&per_page=${limit}&_embed`;
    const response = await got.get(url);
    if (typeof response.data === 'string') {
        response.data = JSON.parse(response.body.trim());
    }
    const data = response.data;

    const items = data.map((item) => {
        const description = renderDescription({
            post: item.content.rendered.replaceAll(/<pre class="js-medie-info-detail.*?>(.*?)<\/pre>/gs, '<pre><code>$1</code></pre>').replaceAll(/<div.+?dw-box-download.+?>(.*?)<\/div>/gs, '<pre>$1</pre>'),
            medias: item._embedded['wp:featuredmedia'],
        });

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parseDate(item.date_gmt),
            author: item._embedded.author[0].name,
        };
    });

    return {
        title: `${category.name} | VCB-Studio`,
        link: `${rootUrl}/archives/category/${category.slug}`,
        item: items,
    };
}
