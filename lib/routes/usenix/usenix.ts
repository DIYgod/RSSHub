// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const url = 'https://www.usenix.org';
import { parseDate } from '@/utils/parse-date';

const seasons = ['spring', 'summer', 'fall', 'winter'];

export default async (ctx) => {
    const last = new Date().getFullYear() + 1;
    const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`).flatMap((url) => seasons.map((season) => `${url}/${season}-accepted-papers`));
    const responses = await got.all(
        urlList.map(async (url) => {
            let res;
            try {
                res = await got(url);
            } catch {
                // ignore 404
            }
            return res;
        })
    );

    const list = responses.filter(Boolean).flatMap((response) => {
        const $ = load(response.data);
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

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('.content').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'USENIX',
        link: url,
        description: 'USENIX Security Symposium Accpeted Papers',
        allowEmpty: true,
        item: items,
    });
};
