import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

import { rootUrl, getSearchParams } from './utils';

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

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: getSearchParams(),
    });

    let items = response.data.data.slice(0, limit).map((item) => ({
        title: item.title || item.brief,
        link: `${rootUrl}/detail/${item.id}`,
        pubDate: parseDate(item.ctime * 1000),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const nextData = JSON.parse(content('script#__NEXT_DATA__').text());
                const articleDetail = nextData.props.initialState.detail.articleDetail;

                item.author = articleDetail.author?.name ?? item.author ?? '';
                item.description = art(path.join(__dirname, 'templates/depth.art'), {
                    articleDetail,
                });

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
