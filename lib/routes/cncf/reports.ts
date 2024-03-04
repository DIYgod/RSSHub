// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.cncf.io';

export default async (ctx) => {
    const url = `${rootURL}/reports/`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.report-item')
        .map((_index, item) => ({
            title: $(item).find('a.report-item__link').attr('title'),
            link: $(item).find('a.report-item__link').attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.parseDate = parseDate(content('p.is-style-spaced-uppercase').splice(':')[1]);
                item.description = content('article > div.has-background').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `CNCF - Reports`,
        link: url,
        item: items,
    });
};
