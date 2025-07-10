import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
const url = 'https://www.usenix.org';
import { parseDate } from '@/utils/parse-date';

const seasons = ['spring', 'summer', 'fall', 'winter'];

export const route: Route = {
    path: '/usenix-security-sympoium',
    categories: ['journal'],
    example: '/usenix/usenix-security-sympoium',
    radar: [
        {
            source: ['usenix.org/conferences/all', 'usenix.org/conferences', 'usenix.org/'],
        },
    ],
    name: 'Security Symposia',
    maintainers: ['ZeddYu'],
    handler,
    url: 'usenix.org/conferences/all',
    description: `Return results from 2020`,
};

async function handler() {
    const last = new Date().getFullYear() + 1;
    const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`).flatMap((url) => seasons.map((season) => `${url}/${season}-accepted-papers`));
    const responses = await Promise.allSettled(
        urlList.map(async (url) => {
            let res;
            try {
                res = await ofetch(url);
            } catch {
                // ignore 404
            }
            return res;
        })
    );

    const list = responses
        .filter((r) => r.status === 'fulfilled' && r.value)
        .flatMap((response) => {
            const $ = load(response.value);
            const pubDate = parseDate($('meta[property=article:modified_time]').attr('content'));
            return $('article.node-paper')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: item.find('h2.node-title > a').text().trim(),
                        link: `${url}${item.find('h2.node-title > a').attr('href')}`,
                        author: item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text().trim(),
                        pubDate,
                    };
                });
        });

    const items = await Promise.allSettled(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.content').html();

                return item;
            })
        )
    );

    return {
        title: 'USENIX',
        link: url,
        description: 'USENIX Security Symposium Accpeted Papers',
        allowEmpty: true,
        item: items.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<any>).value),
    };
}
