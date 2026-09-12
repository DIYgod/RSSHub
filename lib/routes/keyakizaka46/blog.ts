import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/blog',
    categories: ['new-media'],
    example: '/keyakizaka46/blog',
    name: 'Keyakizaka46 Blog 欅坂 46 博客',
    maintainers: ['yj-qin'],
    handler,
};

async function handler() {
    const link = 'https://www.keyakizaka46.com/s/k46o/diary/member';
    const response = await ofetch(link);

    const $ = load(response);

    return {
        allowEmpty: true,
        title: '欅坂46官网 博客',
        link,
        item: $('div.box-newposts div.slider ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('p.ttl').text().trim(),
                    link: $item.find('a').attr('href'),
                    pubDate: timezone(parseDate($item.find('div.box-blog time').text()), 9),
                    author: $item.find('p.ttl').next().text().trim(),
                    description: `<img src="${$item.find('img.js-replaceImage').attr('src')}">`,
                };
            }),
    };
}
