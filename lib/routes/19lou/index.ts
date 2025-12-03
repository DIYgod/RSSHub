import { load } from 'cheerio';
import iconv from 'iconv-lite';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const setCookie = function (cookieName, cookieValue, seconds, path, domain, secure) {
    let expires = null;
    if (seconds !== -1) {
        expires = new Date();
        expires.setTime(expires.getTime() + seconds);
    }
    return [encodeURI(cookieName), '=', encodeURI(cookieValue), expires ? '; expires=' + expires.toGMTString() : '', path ? '; path=' + path : '/', domain ? '; domain=' + domain : '', secure ? '; secure' : ''].join('');
};

export const route: Route = {
    path: '/:city?',
    categories: ['bbs'],
    example: '/19lou/jiaxing',
    parameters: { city: '分类，见下表，默认为 www，即杭州' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '头条',
    maintainers: ['nczitzk'],
    handler,
    description: `| 杭州 | 台州    | 嘉兴    | 宁波   | 湖州   |
| ---- | ------- | ------- | ------ | ------ |
| www  | taizhou | jiaxing | ningbo | huzhou |

| 绍兴     | 湖州   | 温州    | 金华   | 舟山     |
| -------- | ------ | ------- | ------ | -------- |
| shaoxing | huzhou | wenzhou | jinhua | zhoushan |

| 衢州   | 丽水   | 义乌 | 萧山     | 余杭   |
| ------ | ------ | ---- | -------- | ------ |
| quzhou | lishui | yiwu | xiaoshan | yuhang |

| 临安  | 富阳   | 桐庐   | 建德   | 淳安   |
| ----- | ------ | ------ | ------ | ------ |
| linan | fuyang | tonglu | jiande | chunan |`,
};

async function handler(ctx) {
    const city = ctx.req.param('city') ?? 'www';
    if (!isValidHost(city)) {
        throw new InvalidParameterError('Invalid city');
    }

    const rootUrl = `https://${city}.19lou.com`;

    const response = await got({
        method: 'get',
        url: rootUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    $('.title-more').remove();

    let items = $('.center-center-jiazi')
        .find('a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: `https:${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                    headers: {
                        cookie: setCookie('_Z3nY0d4C_', '37XgPK9h', 365, '/', '19lou.com'),
                        referer: rootUrl,
                    },
                });

                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                content('.name-lz, .postView-pk-mod').remove();

                item.author = content('.uname, .user-name').first().text();
                item.description = content('.post-cont').first().html() || content('.thread-cont').html();
                item.pubDate = timezone(parseDate(content('.cont-top-left meta').first().attr('content')), +8);

                return item;
            })
        )
    );

    return {
        title: $('title').text().split('-')[0],
        link: rootUrl,
        item: items,
    };
}
