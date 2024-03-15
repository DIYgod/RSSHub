import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/forum/:id',
    categories: ['bbs'],
    example: '/zhibo8/forum/8',
    parameters: { id: '子论坛 id，可在子论坛 URL 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '子论坛',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `https://bbs.zhibo8.cc/forum/list/?fid=${id}`;

    const response = await got(link);
    const $ = load(response.data);

    const title = $('div.intro > h2').text();
    const list = $('table.topic-list > tbody:nth-child(3) > tr');

    const out = await Promise.all(
        list.toArray().map((item) => {
            item = $(item);
            const a = item.find('td:nth-child(1) > a:nth-child(2)');
            const link = 'https://bbs.zhibo8.cc' + a.attr('href');
            return cache.tryGet(link, async () => {
                const title = a.text();
                const author = item.find('td:nth-child(2) cite a').text();
                const date = item.find('td:nth-child(2) em').text();

                const response = await got(link);
                const $ = load(response.data);
                const description = $('.detail_ent').html();

                return {
                    title,
                    description,
                    author,
                    link,
                    pubDate: timezone(parseDate(date, 'YYYY-MM-DD HH:mm'), +8),
                };
            });
        })
    );

    return {
        title: `${title}—直播吧`,
        link,
        item: out,
    };
}
