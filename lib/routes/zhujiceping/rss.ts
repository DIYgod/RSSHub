import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['zhujiceping.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['cnkmmk'],
    handler,
    url: 'zhujiceping.com/',
};

async function handler() {
    const url = 'https://www.zhujiceping.com/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $('article.excerpt')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateraw = element.find('time').text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
            };
        })
        .get();

    return {
        title: '国外主机测评',
        link: url,
        item: list,
    };
}
