// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const DOMAIN = 'www.moj.gov.cn';

export default async (ctx) => {
    const rootUrl = `https://${DOMAIN}`;
    const currentUrl = `${rootUrl}/lfyjzj/lflfyjzj/index.html`;
    const { data: response } = await got(currentUrl);
    const $ = load(response);
    const siteName = $('title:first').text();
    const theme = $('div.list_title').text();
    const description = `${siteName} - ${theme}`;
    const icon = new URL('/images/sfbgw_favicon.ico', rootUrl).href;
    const indexes = $('ul.newsMsgList_zzy li')
        .toArray()
        .map((li) => {
            const a = $(li).find('a');
            const pubDate = $(li).find('div.rightData').text();
            const href = a.prop('href');
            const link = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            return {
                title: a.text(),
                link,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });

    const items = await Promise.all(
        indexes.map((item) =>
            cache.tryGet(`gov:mof:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);
                item.description = content('div.TRS_Editor').html();
                item.author = content('div.sT_left span:first').text().split('：')[1];
                const pubDate = content('div.sT_left span:last').text().split('：')[1];
                item.pubDate = pubDate ? timezone(parseDate(pubDate), +8) : item.pubDate;
                return item;
            })
        )
    );

    ctx.set('data', {
        item: items,
        title: theme,
        link: currentUrl,
        description,
        author: siteName,
        icon,
    });
};
