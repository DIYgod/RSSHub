import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import utils from './utils';

export const route: Route = {
    path: '/news/:type/:lang?',
    categories: ['government'],
    example: '/ccac/news/all',
    parameters: { type: 'Category', lang: 'Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese), `tc`(Traditional Chinese) and `pt`(Portuguese)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest News',
    maintainers: ['linbuxiao'],
    handler,
    description: `Category

| All | Detected Cases | Investigation Reports or Recommendations | Annual Reports | CCAC's Updates |
| --- | -------------- | ---------------------------------------- | -------------- | -------------- |
| all | case           | Persuasion                               | AnnualReport   | PCANews        |`,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'sc';
    const type = utils.TYPE[ctx.req.param('type')];

    const BASE = utils.langBase(lang);
    const response = await got(BASE);
    const articles = await utils.parseArticles(response.data);

    const list = utils
        .typeFilter(articles, type)
        .slice(0, getRouteLimit(ctx, 30))
        .map((item) => ({
            title: item.name,
            category: item.tags.map((tag) => tag.name),
            link: utils.BASE_URL + item.url,
            pubDate: timezone(parseDate(item.time, 'YYYY-MM-DD'), 8),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(detailResponse.data);
                $('.article_details_body > *').removeAttr('style');
                item.description = $('.article_details_body').html();
                return item;
            })
        )
    );

    return {
        title: `CCAC ${type}`,
        link: BASE,
        description: `CCAC ${type}`,
        language: ctx.req.param('lang') ? utils.LANG_TYPE[ctx.req.param('lang')] : utils.LANG_TYPE.sc,
        item: items,
    };
}
