import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.sis001.com';

export const route: Route = {
    path: '/forum/:id?',
    categories: ['bbs'],
    example: '/sis001/forum/322',
    parameters: { id: '子版块 ID，可在子论坛 URL 找到，默认为 `Funny Jokes | 短篇笑话区`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '子版块',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { id = 76 } = ctx.req.param();
    const url = `${baseUrl}/forum/forum-${id}-1.html`;

    const response = await got(url);

    const $ = load(response.data);

    let items = $('form table')
        .last()
        .find('tbody')
        .toArray()
        .slice(1) // skip first empty row
        .map((item) => {
            item = $(item);
            return {
                title: item.find('th em').text() + ' ' + item.find('span a').eq(0).text(),
                link: new URL(item.find('span a').eq(0).attr('href'), `${baseUrl}/forum/`).href,
                author: item.find('.author a').text(),
                pubDate: parseDate(item.find('.author em').text(), 'YYYY-M-D'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.category = $('.posttags a')
                    .toArray()
                    .map((a) => $(a).text());
                item.pubDate = timezone(
                    parseDate(
                        $('.postinfo')
                            .eq(0)
                            .text()
                            .match(/发表于 (.*)\s*只看该作者/)[1],
                        'YYYY-M-D HH:mm'
                    ),
                    8
                );
                $('div[id^=postmessage_] table, fieldset, .posttags').remove();
                item.description = $('div[id^=postmessage_]').eq(0).html() + ($('.defaultpost .postattachlist').html() ?? '');
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}
