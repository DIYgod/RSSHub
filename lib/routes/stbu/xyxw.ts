import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');
export const route: Route = {
    path: '/xyxw',
    categories: ['university'],
    example: '/stbu/xyxw',
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
            source: ['stbu.edu.cn/html/news/xueyuan', 'stbu.edu.cn'],
        },
    ],
    name: '学院新闻',
    maintainers: ['HyperCherry'],
    handler,
    url: 'stbu.edu.cn/html/news/xueyuan',
};

async function handler() {
    const baseUrl = 'http://www.stbu.edu.cn';
    const requestUrl = `${baseUrl}/html/news/xueyuan/`;
    const { data: response } = await got(requestUrl, {
        responseType: 'buffer',
    });
    const $ = load(gbk2utf8(response));
    const list = $('.style_2 .Simple_title')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    responseType: 'buffer',
                });
                const $ = load(gbk2utf8(response));
                item.description = $('.artmainl .articlemain').first().html();
                item.pubDate = timezone(parseDate($('.artmainl .info').text().split('|')[2].split('：')[1].trim()), +8);
                return item;
            })
        )
    );

    return {
        title: '四川工商学院 - 学院新闻',
        link: requestUrl,
        description: '四川工商学院 - 学院新闻',
        item: items,
    };
}
