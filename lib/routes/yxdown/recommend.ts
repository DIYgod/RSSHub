import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { rootUrl, getCookie } from './utils';

export const route: Route = {
    path: '/recommend',
    categories: ['game'],
    example: '/yxdown/recommend',
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
            source: ['yxdown.com/'],
        },
    ],
    name: '精彩推荐',
    maintainers: ['nczitzk'],
    handler,
    url: 'yxdown.com/',
};

async function handler() {
    const currentUrl = `${rootUrl}/news/`;
    const cookie = await getCookie();
    const response = await got(currentUrl, {
        headers: {
            cookie,
        },
    });

    const $ = load(response.data);

    const list = $('ul li a b')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.parent().attr('href'),
            };
        });

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
        title: '精彩推荐 - 游讯网',
        link: currentUrl,
        item: items,
    };
}
