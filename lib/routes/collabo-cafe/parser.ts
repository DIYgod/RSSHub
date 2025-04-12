import { type DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { CheerioAPI } from 'cheerio';

export function parseItems($: CheerioAPI): DataItem[] {
    return $('div.top-post-list article')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const title = a.attr('title')!;
            const link = a.attr('href');
            const pubDate = parseDate($el.find('span.date.gf.updated').text());
            const author = $el.find('span.author span.fn').text();
            const category = [$el.find('span.cat-name').text()];
            const description = $el.find('div.description p').text();
            const image = $el.find('img').attr('data-src');
            return {
                title,
                link,
                pubDate,
                author,
                category,
                description,
                image,
                banner: image,
            };
        });
}
