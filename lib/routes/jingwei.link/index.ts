import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/jingwei.link',
    name: '文章',
    maintainers: ['a180285'],
    handler,
};

async function handler() {
    const url = 'https://jingwei.link/';
    const response = await ofetch(url);
    const $ = load(response);
    const resultItem = $("article[class='article-item']")
        .toArray()
        .map((elem) => {
            const $esction = $(elem).find('section[class="post-preview"]');

            return {
                title: $esction.find('h2').text(),
                description: $esction.find('h3').text(),
                link: new URL($esction.find('a').attr('href')!, url).href,
                author: '敬维',
                category: $(elem)
                    .find('a.post-tag')
                    .toArray()
                    .map((tag) => $(tag).text()),
                pubDate: parseDate($(elem).find('time.post-date').attr('datetime')!, 'YY-MM-DD'),
            };
        });

    return {
        title: '敬维-以认真的态度做完美的事情',
        link: url,
        item: resultItem,
    };
}
