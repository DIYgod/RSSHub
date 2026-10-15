import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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
        .filter((item) => $(item).find('a').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const dateText = $item.find('em').text().trim();
            const date = dateText ? parseDate(dateText, /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? 'YYYY-MM-DD' : undefined, true) : undefined;
            const articleUrl = new URL($item.find('a').attr('href')!, link);
            articleUrl.pathname = articleUrl.pathname.replace('ArticleDetail.do', 'InternalArticleDetail.do');
            return {
                title: $item.find('a').attr('title') || $item.find('a').text(),
                link: articleUrl.href,
                pubDate: date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`hunanpea:content:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                return $('.content_area').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: `${$('.sitemap h2').text()} - ${$('head title').text()}`,
        link,
        item: items,
    };
}
