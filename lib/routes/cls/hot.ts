import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDepthDescription } from './templates/depth';
import { getSearchParams, rootUrl } from './utils';

export const route: Route = {
    path: '/hot',
    categories: ['finance'],
    example: '/cls/hot',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cls.cn/'],
        },
    ],
    name: '热门文章排行榜',
    maintainers: ['5upernova-heng', 'nczitzk'],
    handler,
    url: 'cls.cn/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const apiUrl = `${rootUrl}/v2/article/hot/list`;

    const response = await ofetch(apiUrl, {
        query: getSearchParams(),
    });

    let items = response.data.slice(0, limit).map((item) => ({
        title: item.title || item.brief,
        link: `${rootUrl}/detail/${item.id}`,
        pubDate: parseDate(item.ctime, 'X'),
        author: item.author,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                const articleDetail = nextData.props.pageProps.articleDetail;

                item.author = articleDetail.author?.name ?? item.author ?? '';
                item.description = renderDepthDescription(articleDetail);

                return item;
            })
        )
    );

    return {
        title: '财联社 - 热门文章排行榜',
        link: rootUrl,
        item: items,
    };
}
