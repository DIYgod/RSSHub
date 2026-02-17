import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'http://www.rodong.rep.kp';

export const route: Route = {
    path: '/news/:language?',
    categories: ['traditional-media'],
    example: '/rodong/news',
    parameters: { language: 'Language, see below, `ko` by default' },
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
            source: ['rodong.rep.kp/cn/index.php', 'rodong.rep.kp/en/index.php', 'rodong.rep.kp/ko/index.php', 'rodong.rep.kp/cn', 'rodong.rep.kp/en', 'rodong.rep.kp/ko'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'rodong.rep.kp/cn/index.php',
    description: `| 조선어 | English | 中文 |
| ------ | ------- | ---- |
| ko     | en      | cn   |`,
};

async function handler(ctx) {
    const { language = 'ko' } = ctx.req.param();
    const link = `${host}/${language}/index.php?MkBAMkAxQA==`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('.date_news_list .row')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.media-body').text(),
                link: `${host}/${language}/${item.find('.media-body a').attr('href')}`,
                author: item.find('.col-sm-3').text(),
                pubDate: parseDate(item.find('.news_date').text(), 'YYYY.M.D.'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.news_Title, .NewsDetail, .News_Detail, #moveNews').remove();
                item.description = $('.col-sm-8').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    };
}
