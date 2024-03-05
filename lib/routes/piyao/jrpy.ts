// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.piyao.org.cn';

export default async (ctx) => {
    const currentUrl = `${rootUrl}/jrpy/index.htm`;

    const response = await got(currentUrl);
    const $ = load(response.data);
    const list = $('ul#list li')
        .map((_, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.title = content('div.con_tit > h2').text();
                item.description = content('div.con_txt').html();
                item.pubDate = parseDate(content('div.con_tit > p > span').text().split('时间：')[1]);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '今日辟谣',
        link: currentUrl,
        item: items,
    });
};
