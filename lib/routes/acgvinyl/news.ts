import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['anime'],
    example: '/news',
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
            source: ['www.acgvinyl.com'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['williamgateszhao'],
    handler,
    url: 'www.acgvinyl.com/col.jsp?id=103',
    zh: {
        name: '黑胶新闻',
    },
};

async function handler(ctx) {
    const rootUrl = 'http://www.acgvinyl.com';

    const newsIndexResponse = await ofetch(`${rootUrl}/col.jsp?id=103`);
    const $ = load(newsIndexResponse);
    const newsIndexJsonText = $('script:contains("window.__INITIAL_STATE__")').text().replaceAll('window.__INITIAL_STATE__=', '');
    const newsIndexJson = JSON.parse(newsIndexJsonText);

    const newsListResponse = await ofetch(`${rootUrl}/rajax/news_h.jsp?cmd=getWafNotCk_getList`, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            page: '1',
            pageSize: String(ctx.req.query('limit') ?? 20),
            fromMid: newsIndexJson.modules.module366.id,
            idList: `[${newsIndexJson.modules.module366.prop3}]`,
            sortKey: newsIndexJson.modules.module366.blob0.sortKey,
            sortType: newsIndexJson.modules.module366.blob0.sortType,
        }).toString(),
    });
    const list = JSON.parse(newsListResponse);

    if (!list?.success || !Array.isArray(list?.list)) {
        return null;
    }

    const items = await Promise.all(
        list.list.map((item) =>
            cache.tryGet(item.url, async () => {
                const detailResponse = await ofetch(`${rootUrl}${item.url}`);
                const $ = load(detailResponse);
                const detailJsonText = $('script:contains("window.__INITIAL_STATE__")').text().replaceAll('window.__INITIAL_STATE__=', '');
                const detailJson = JSON.parse(detailJsonText);
                const detail = load(detailJson.modules.module2.newsInfo.content);
                detail('[style]').removeAttr('style');
                return {
                    title: item.title,
                    link: `${rootUrl}${item.url}`,
                    pubDate: parseDate(item.date),
                    description: detail.html(),
                };
            })
        )
    );

    return {
        title: 'ACG Vinyl - 黑胶 - 黑胶新闻',
        link: 'http://www.acgvinyl.com/col.jsp?id=103',
        item: items,
    };
}
