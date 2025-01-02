import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const handler = async () => {
    const rootUrl = 'https:///www.wchscu.cn';
    const currentUrl = 'https://www.wchscu.cn/public/notice/recruit';
    const { data: response } = await got(currentUrl);

    const $ = load(response);
    const list = $('div#datalist div.list div.item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('span.s1').text(),
                pubDate: parseDate(item.find('span.s2').text()),
                link: new URL(item.find('a').prop('href'), rootUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                const newLocal = $('div.xxy3 .content');
                // 选择类名为“comment-body”的第一个元素
                item.description = newLocal.html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};

export const route: Route = {
    name: '招聘公告',
    path: '/recruit',
    example: '/wchscu/recruit',
    url: 'www.wchscu.cn',
    maintainers: ['ViggoC'],
    categories: ['other'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },

    radar: [
        {
            source: ['www.wchscu.cn/public/notice/recruit'],
        },
    ],
    handler,
};
