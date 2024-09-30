import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/update', '/versions'],
    name: 'Unknown',
    maintainers: ['Cesaryuan', 'nczitzk'],
    handler,
    url: 'getquicker.net/Help/Versions',
};

async function handler() {
    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/Help/Versions`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text().trim(),
                link: `${rootUrl}${a.attr('href')}`,
                description: item.find('.article-content').html(),
                pubDate: parseDate(item.find('.text-secondary').first().text()),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
