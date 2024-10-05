import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['hkjunkcall.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'hkjunkcall.com/',
};

async function handler() {
    const rootUrl = 'https://hkjunkcall.com';
    const currentUrl = `${rootUrl}/cdpushdash.asp`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.hh15')
        .map((_, item) => {
            item = $(item).parent();

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.card').find('div, h2').remove();

                item.guid = item.link.split('/').pop();
                item.description = content('.card').html();
                item.pubDate = parseDate(detailResponse.data.match(/<br \/>(\d+-\d+-\d+)<\/div><\/a>/)[1]);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
