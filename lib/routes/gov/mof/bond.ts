// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const domain = 'gks.mof.gov.cn';
const theme = 'guozaiguanli';

export default async (ctx) => {
    const { category = 'gzfxgzdt' } = ctx.req.param();
    const currentUrl = `https://${domain}/ztztz/${theme}/${category}/`;
    const { data: response } = await got(currentUrl);
    const $ = load(response);
    const title = $('title').text();
    const author = $('div.zzName').text();
    const siteName = $('meta[name="SiteName"]').prop('content');
    const description = $('meta[name="ColumnDescription"]').prop('content');
    const indexes = $('ul.liBox li')
        .toArray()
        .map((li) => {
            const a = $(li).find('a');
            const pubDate = $(li).find('span').text();
            const href = a.prop('href');
            const link = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            return {
                title: a.prop('title'),
                link,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });

    const items = await Promise.all(
        indexes.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);
                item.description = content('div.my_doccontent').html();
                item.author = author;
                return item;
            })
        )
    );

    ctx.set('data', {
        item: items,
        title,
        link: currentUrl,
        description: `${description} - ${siteName}`,
        author,
    });
};
