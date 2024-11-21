import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { parseToken } from '@/routes/xueqiu/cookies';

export const route: Route = {
    path: '/today',
    categories: ['finance'],
    example: '/xueqiu/today',
    parameters: {},
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
            source: ['xueqiu.com/today'],
        },
    ],
    name: '今日话题',
    maintainers: ['nczitzk'],
    handler,
    url: 'xueqiu.com/today',
};

async function handler(ctx) {
    const size = ctx.req.query('limit') ?? '20';

    const rootUrl = 'https://xueqiu.com';
    const currentUrl = `${rootUrl}/today`;
    const apiUrl = `${rootUrl}/statuses/hot/listV2.json?since_id=-1&size=${size}`;

    const token = await parseToken(currentUrl);
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: rootUrl,
            Cookie: token,
        },
    });

    let items = response.data.items.map((item) => {
        item = item.original_status;

        return {
            title: item.title || item.rawTitle || item.description.replaceAll(/<(.*?)>/g, ''),
            link: `${rootUrl}${item.target}`,
            pubDate: parseDate(item.created_at),
            author: item.user.screen_name,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: rootUrl,
                        Cookie: token,
                    },
                });

                const content = load(detailResponse.data);

                item.description = content('.article__bd__detail').html();

                return item;
            })
        )
    );

    return {
        title: '今日话题 - 雪球',
        link: currentUrl,
        item: items,
    };
}
