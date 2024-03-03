// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.fxiaoke.com/crm';
const baseTitle = '纷享销客 CRM';
const titleMap = new Map([
    ['news', `全部文章 - ${baseTitle}`],
    ['blog', `文章干货 - ${baseTitle}`],
    ['articles', `CRM 知识 - ${baseTitle}`],
    ['about-influence', `纷享动态 - ${baseTitle}`],
    ['customers', `签约喜报 - ${baseTitle}`],
]);

export default async (ctx) => {
    const t = ctx.req.param('type');
    const title = titleMap.get(t);
    const url = `${baseUrl}/${t}/`;
    const resp = await got(url);
    const $ = load(resp.data);
    const desc = $('.meeting').text().trim();
    let items = $('.content-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const c1 = item.find('.baike-content-t1');
            const c3 = item.find('.baike-content-t3').find('span');
            return {
                title: c1.text().trim(),
                // pubDate: parseDate(c3.first().text().trim()),
                link: item.find('a').attr('href'),
                author: c3.last().text().trim(),
            };
        });
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = load(resp.data);
                const firstViewBox = $('.body-wrapper-article').first();

                firstViewBox.find('img').each((_, img) => {
                    img = $(img);
                    if (img.attr('zoomfile')) {
                        img.attr('src', img.attr('zoomfile'));
                        img.removeAttr('zoomfile');
                        img.removeAttr('file');
                    }
                    img.removeAttr('onmouseover');
                });

                item.description = firstViewBox.html();
                item.pubDate = parseDate($('.month-day').first().text().trim());
                return item;
            })
        )
    );
    ctx.set('data', {
        title,
        link: url,
        description: desc,
        item: items,
    });
};
