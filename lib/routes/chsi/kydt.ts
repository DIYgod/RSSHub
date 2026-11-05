import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://yz.chsi.com.cn';

export const route: Route = {
    path: '/kydt',
    categories: ['study'],
    example: '/chsi/kydt',
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
            source: ['yz.chsi.com.cn/kyzx/kydt'],
        },
    ],
    name: '考研动态',
    maintainers: ['SunBK201'],
    handler,
    url: 'yz.chsi.com.cn/kyzx/kydt',
};

async function handler() {
    const response = await got(`${host}/kyzx/kydt`);

    const $ = load(response.data);
    const list = $('ul.news-list').children();

    const candidates = list.toArray().map((element) => {
        const $item = $(element);
        const path = $item.find('a').attr('href')!;
        return {
            title: $item.find('a').text(),
            link: new URL(path, host).href,
            path,
            pubDate: timezone(parseDate($item.find('.span-time, .time').first().text()), 8),
        };
    });
    const ordered = candidates;
    const selected = ordered;
    const items = await Promise.all(
        selected.map((item) =>
            cache.tryGet(item.link, async () => {
                let description: string;
                if (!item.path.startsWith('https://') && !item.path.startsWith('http://')) {
                    const result = await got(item.link);
                    const $ = load(result.data);
                    description = $('#article_dnull').html()!.trim();
                } else {
                    description = item.title;
                }
                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description,
                };
            })
        )
    );

    return {
        title: '中国研究生招生信息网 - 考研动态',
        link: `${host}/kyzx/kydt/`,
        description: '中国研究生招生信息网 - 考研动态',
        item: items,
    };
}
