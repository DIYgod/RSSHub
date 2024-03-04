// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'http://www.sim.cas.cn/';

export default async (ctx) => {
    const link = new URL('xwzx2016/kyjz/', host).href;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.list-news li')
        .toArray()
        .filter((e) => !$(e).attr('style'))
        .map((e) => {
            e = $(e);
            return {
                link: new URL(e.find('a').attr('href'), link).href,
                pubDate: e.find('span').text().replace('[', '').replace(']', ''),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const author = $('.qtinfo.hidden-lg.hidden-md.hidden-sm').text();
                const reg = /文章来源：(.*?)\|/g;

                item.title = $('p.wztitle').text().trim();
                item.author = reg.exec(author)[1].toString().trim();
                item.description = $('.TRS_Editor').html();
                item.pubDate = parseDate(item.pubDate);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '中国科学院上海微系统与信息技术研究所 -- 科技进展',
        link,
        item: out,
    });
};
