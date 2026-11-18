import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/blog',
    categories: ['new-media'],
    example: '/keyakizaka46/blog',
    name: 'Blog 博客',
    maintainers: ['yj-qin'],
    handler,
};

async function handler() {
    const link = 'https://www.keyakizaka46.com/s/k46o/diary/member';
    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: '欅坂46官网 博客',
        link,
        item: $('div.box-newposts div.slider ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const sourceDate = $item.find('div.box-blog time').text().trim();
                const date = sourceDate ? parseDateStrict(sourceDate, 'YYYY.MM.DD HH:mm', 9) : undefined;
                return {
                    title: $item.find('p.ttl').text(),
                    link: $item.find('a').attr('href'),
                    pubDate: date,
                    author: $item.find('p.ttl').next().text().trim(),
                    description: `<img src="${$item.find('img.js-replaceImage').attr('src')}">`,
                };
            }),
    };
}
