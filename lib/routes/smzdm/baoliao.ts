import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/baoliao/:uid',
    categories: ['shopping'],
    example: '/smzdm/baoliao/7367111021',
    parameters: { uid: '用户id，网址上直接可以看到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zhiyou.smzdm.com/member/:uid/baoliao'],
        },
    ],
    name: '用户爆料',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const link = `https://zhiyou.smzdm.com/member/${ctx.req.param('uid')}/baoliao/`;

    const response = await got(link);
    const $ = load(response.data);
    const title = $('.info-stuff-nickname').text();

    const list = $('.pandect-content-stuff')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.pandect-content-title a').text(),
                link: item.find('.pandect-content-title a').attr('href'),
                pubDate: timezone(parseDate(item.find('.pandect-content-time').text(), ['YYYY-MM-DD', 'MM-DD HH:mm']), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('article.txt-detail').html();
                item.pubDate = timezone(parseDate($('.time').first().text().trim().replace('更新时间：', '')), 8);
                item.author = title;

                return item;
            })
        )
    );

    return {
        title: `${title}的爆料 - 什么值得买`,
        link,
        item: out,
    };
}
