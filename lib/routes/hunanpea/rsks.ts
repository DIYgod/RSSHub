import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rsks/:guid',
    categories: ['study'],
    example: '/hunanpea/rsks/2f1a6239-b4dc-491b-92af-7d95e0f0543e',
    parameters: { guid: '分类 id，可在 URL 中找到' },
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
            source: ['rsks.hunanpea.com/Category/:guid/ArticlesByCategory.do'],
        },
    ],
    name: '公告',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'http://rsks.hunanpea.com';
    const guid = ctx.req.param('guid');
    const link = `${baseUrl}/Category/${guid}/ArticlesByCategory.do?PageIndex=1`;
    const { data: response } = await got(link);

    const $ = load(response);
    const list = $('#column_content > ul > li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${item.find('a').attr('href').replace('ArticleDetail.do', 'InternalArticleDetail.do?')}`,
                pubDate: timezone(parseDate(item.find('em').text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.content_area').html();

                return item;
            })
        )
    );

    return {
        title: `${$('.sitemap h2').text()} - ${$('head title').text()}`,
        link,
        item: items,
    };
}
