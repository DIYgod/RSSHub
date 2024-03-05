// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://gs.dhu.edu.cn';

const map = {
    trend: '/7205/list.htm',
    notice: '/7206/list.htm',
    class: '/xkks/list.htm',
};
export default async (ctx) => {
    const type = ctx.req.param('type') || 'class';
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.sub_list > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: a.attr('href').startsWith('http') ? a.attr('href') : `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    // item content
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.wp_articlecontent').first().html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '东华大学研究生-' + $('.Column_Name').text(),
        link,
        item: items,
    });
};
