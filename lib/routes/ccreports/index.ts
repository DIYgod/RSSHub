// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.ccreports.com.cn';

export default async (ctx) => {
    const listData = await got.get(rootUrl);
    const $ = load(listData.data);
    const list = $('div.index-four-content > div.article-box')
        .find('div.new-child')
        .map((_, item) => ({
            title: $(item).find('p.new-title').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            author: $(item)
                .find('p.new-desc')
                .text()
                .match(/作者：(.*?)\s/)[1],
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailData = await got.get(item.link);
                const $ = load(detailData.data);
                item.description = $('div.pdbox').html();
                item.pubDate = timezone(parseDate($('div.newbox > div.newtit > p').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '消费者报道',
        link: rootUrl,
        item: items,
    });
};
