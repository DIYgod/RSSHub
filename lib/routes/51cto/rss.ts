import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/51cto',
    radar: [
        {
            source: ['51cto.com/'],
        },
    ],
    name: '推荐',
    maintainers: ['cnkmmk'],
    handler,
    url: '51cto.com/',
};

async function handler() {
    const url = 'https://51cto.com';
    const response = await got(`${url}`);
    const $ = load(response.data);

    const list = $('div.article-irl-c.split-left-l')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a.usehover.article-irl-ct_title').text();
            const link = element.find('a.usehover.article-irl-ct_title').attr('href');
            const description = element.find('a.split-top-m.usehover.pc-three-line.article-abstract').text();
            const dateraw = element.find('p.article-irl-cb_time').text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DD HH:mm:ss'),
            };
        })
        .get();

    return {
        title: '51CTO',
        link: url,
        item: list,
    };
}
