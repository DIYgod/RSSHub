// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const language = ctx.req.param('language') || 'en';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}director-general/speeches`;
    const apiUrl = `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.sf-detail-body-wrapper').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Speeches - WHO',
        link: currentUrl,
        item: items,
    });
};
