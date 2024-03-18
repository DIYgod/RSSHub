import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

export const route: Route = {
    path: '/:keywords/:security_key?',
    radar: [
        {
            source: ['lightNovel.us/'],
            target: '/:keywords/:security_key',
        },
    ],
    name: 'Unknown',
    maintainers: ['nightmare-mio'],
    handler,
    url: 'lightNovel.us/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.lightnovel.us';
    const { type, keywords, security_key = config.lightnovel.cookie } = ctx.req.param();
    const { data: response } = await got({
        method: 'POST',
        url: `${baseUrl}/proxy/api/search/search-result`,
        headers: {
            // 此处是为什么
            'User-Agent': config.trueUA,
        },
        json: {
            is_encrypted: 0,
            platform: 'pc',
            client: 'web',
            sign: '',
            gz: 0,
            d: {
                q: keywords,
                type: 0,
                page: 1,
                security_key,
            },
        },
    });
    const list = response.data.articles
        .map((item) => ({
            title: item.title,
            link: `${baseUrl}/cn/detail/${item.aid}`,
            pubDate: parseDate(item.time),
            author: item.author,
        }))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 5);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got({
                    method: 'GET',
                    url: item.link,
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                });

                const $ = load(response);
                item.description = $('#article-main-contents').html();
                return item;
            })
        )
    );

    return {
        title: `轻之国度-追踪${keywords}更新-${type} `,
        link: baseUrl,
        item: items,
    };
}
