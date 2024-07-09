import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/global/jlpt',
    name: '日本语能力测试(JLPT)通知',
    url: 'jlpt.neea.edu.cn',
    maintainers: ['nczitzk'],
    example: '/neea/global/jlpt',
    parameters: {},
    categories: ['study'],
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['jlpt.neea.edu.cn', 'jlpt.neea.cn'],
            target: '/global/jlpt',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://news.neea.edu.cn/JLPT/1';
    const newsUrl = `${baseUrl}/newslist.htm`;
    const response = await got.get(newsUrl);
    const $ = load(response.data);
    const list = $('a').get();
    const items = await Promise.all(
        list.map(async (item) => {
            const title = $(item).text();
            const link = `${baseUrl}/${$(item).attr('href')}`;
            const date = $(item)
                .text()
                .match(/(\d{4}-\d{2}-\d{2})/);
            const data = await cache.get(link);
            if (data) {
                return JSON.parse(data);
            }
            const response = await got.get(link);
            const $$ = load(response.data);
            const description = $$('.dvContent').html();
            const ret = {
                title,
                link,
                pubDate: date ? timezone(parseDate(date[1]), +8) : '',
                description,
            };
            cache.set(link, ret);
            return ret;
        })
    );

    return {
        title: '日本语能力测试(JLPT)通知',
        link: newsUrl,
        item: items,
    };
}
