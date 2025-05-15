import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl } from './utils';

const titles = {
    280: '最新',
    333: '新品',
    331: 'DeFi',
    334: 'NFT',
    332: '存储',
    330: '波卡',
    297: '行情',
    296: '活动',
};

export const route: Route = {
    path: '/:id?',
    categories: ['new-media', 'popular'],
    example: '/odaily',
    parameters: { id: 'id，见下表，默认为最新' },
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
            source: ['0daily.com/'],
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
    url: '0daily.com/',
    description: `| 最新 | 新品 | DeFi | NFT | 存储 | 波卡 | 行情 | 活动 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- |
| 280  | 333  | 331  | 334 | 332  | 330  | 297  | 296  |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '280';

    const currentUrl = `${rootUrl}/api/pp/api/app-front/feed-stream?feed_id=${id}&b_id=&per_page=${ctx.req.query('limit') ?? 25}`;

    const response = await got(currentUrl);

    let items = response.data.data.items
        .map((item) => ({
            title: item.title,
            type: item.entity_type,
            description: `<p>${item.summary}</p>`,
            link: `${rootUrl}/${item.entity_type}/${item.entity_id}`,
            pubDate: timezone(parseDate(item.published_at), +8),
        }))
        .filter((item) => item.type !== 'newsflash');

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const ssr = JSON.parse(`{${detailResponse.data.match(/window\.__INITIAL_STATE__ = {(.*)}/)[1]}}`);

                const content = load(ssr.post.detail.content, null, false);
                content('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?x-oss-process')[0];
                    img.attribs.src = img.attribs.src.split('!heading')[0];
                });

                item.description = content.html();
                item.author = ssr.post.user.name;

                delete item.type;

                return item;
            })
        )
    );

    return {
        title: `${titles[id]} - Odaily星球日报`,
        link: rootUrl,
        item: items,
    };
}
