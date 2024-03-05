// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://www.dayanzai.me/';

export default async (ctx) => {
    const { category, fulltext } = ctx.req.param();
    const currentUrl = rootUrl + category;
    const response = await got.get(currentUrl);
    const $ = load(response.data);
    const lists = $('div.c-box > div > div.c-zx-list > ul > li');
    const reg = /日期：(.*?(\s\(.*?\))?)\s/;
    const list = lists
        .map((index, item) => {
            item = $(item).find('div');
            let date = reg.exec(item.find('div.r > p.other').text())[1];
            if (date.includes('周') || date.includes('月')) {
                date = /\((.*?)\)/.exec(date)[1];
                date = parseDate(date, 'MM-DD');
            } else if (date.includes('年')) {
                date = /\((.*?)\)/.exec(date)[1];
                date = parseDate(date, 'YYYY-MM-DD');
            } else {
                date = parseRelativeDate(date);
            }
            return {
                title: item.find('div.r > p.r-top > span > a').text(),
                pubDate: timezone(date, +8),
                description: item.find('div.r > p.desc').text(),
                link: item.find('div.r > p.r-top > span > a').attr('href'),
            };
        })
        .get();
    const items =
        fulltext === 'y'
            ? await Promise.all(
                  list.map((item) =>
                      cache.tryGet(item.link, async () => {
                          const detailResponse = await got.get(item.link);
                          const content = load(detailResponse.data);
                          item.description = content('div.intro-box').html();
                          return item;
                      })
                  )
              )
            : list;

    ctx.set('data', {
        title: `大眼仔旭 ${category}`,
        link: currentUrl,
        description: `大眼仔旭 ${category} RSS`,
        item: items,
    });
};
