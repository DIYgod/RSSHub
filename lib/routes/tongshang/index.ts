import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/tongshang',
    name: '通商',
    maintainers: ['snipersteve'],
    handler,
};

async function handler() {
    const url = 'https://www.tongshang.com/article/research/';
    const oriUrl = 'https://www.tongshang.com';
    const res = await ofetch(`${oriUrl}/TemResolve/?TemPresolveId=32&classid=30&ObjI=0&publicvar=1&charset=UTF-8`, {
        responseType: 'text',
    });
    const match = res.match(/document\.write\((".*")\);/s);
    if (!match) {
        throw new Error('Unable to extract the article list from the template response');
    }
    const $ = load(JSON.parse(match[1].replaceAll(/[\r\n\t]/g, ' ')));
    const list = $('li').toArray();

    const out = await Promise.all(
        list.map((item) => {
            const $item = $(item);
            const subUrl = $item.find('a').attr('href');
            const itemUrl = oriUrl + subUrl;
            const pubDate = timezone(parseDate($item.find('.font_ts').text()), 8);

            return cache.tryGet(itemUrl, async () => {
                const response = await ofetch(itemUrl);
                const $d = load(response);

                return {
                    title: $d('.lm_newsCont_part1 .txt').text(),
                    link: itemUrl,
                    pubDate,
                    description: $d('.lm_newsCont_part2 .left').html(),
                };
            });
        })
    );

    return {
        title: '通商研究 - 通商律师事务所',
        link: url,
        item: out,
    };
}
