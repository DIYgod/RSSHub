import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl, getCookie } from './utils';

export const route: Route = {
    path: '/news/:category?',
    categories: ['game'],
    example: '/yxdown/news',
    parameters: { category: '分类，见下表，默认为资讯首页' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 资讯首页 | 业界动态 | 视频预告 | 新作发布 | 游戏资讯 | 游戏评测 | 网络游戏 | 手机游戏 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | dongtai  | yugao    | xinzuo   | zixun    | pingce   | wangluo  | shouyou  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ? `${ctx.req.param('category')}/` : '';

    const currentUrl = `${rootUrl}/news/${category}`;

    const cookie = await getCookie();

    const response = await got(currentUrl, {
        headers: {
            cookie,
        },
    });
    const $ = load(response.data);

    const list = $('.div_zixun h2 a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        cookie,
                    },
                });
                const content = load(detailResponse.data);

                content('h1, .intro').remove();

                item.description = content('.news').html();
                item.pubDate = timezone(parseDate(content('meta[property="og:release_date"]').attr('content')), +8);

                return item;
            })
        )
    );

    return {
        title: `${$('.now').text()} - 游讯网`,
        link: currentUrl,
        item: items,
    };
}
