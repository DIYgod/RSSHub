import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

const getArticleDetail = (link) =>
    cache.tryGet(link, async () => {
        const response = await got(link);
        const $ = load(response.data);
        $('div.article-audio-player__center-tooltip').remove();
        const nextData = JSON.parse($('head script[type="application/ld+json"]').first().text());

        const figure = $('figure[class^=css-]').first().parent().parent().html() || '';
        const body = $('p[data-component="paragraph"]').parent().parent().html();
        const article = figure + body;
        const categories = nextData.keywords?.map((k) => k);

        return { article, categories };
    });

export const route: Route = {
    path: '/:endpoint',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/economist/latest',
    parameters: { endpoint: 'Category name, can be found on the [official page](https://www.economist.com/rss). For example, https://www.economist.com/china/rss.xml to china' },
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
            source: ['economist.com/:endpoint'],
        },
    ],
    name: 'Category',
    maintainers: ['ImSingee'],
    handler,
};

async function handler(ctx) {
    const endpoint = ctx.req.param('endpoint');
    const feed = await parser.parseURL(`https://www.economist.com/${endpoint}/rss.xml`);

    const limit = getRouteLimit(ctx, 30);
    const sourceOrder = ctx.req.query('sorted') === 'false';
    const candidates = feed.items.slice(0, Math.max(30, limit)).map((item) => ({ ...item, pubDate: item.pubDate ? parseDate(item.pubDate) : undefined }));
    const datesComplete = candidates.every((item) => item.pubDate && Number.isFinite(item.pubDate.getTime()));
    if (!sourceOrder && datesComplete) {
        candidates.sort((first, second) => second.pubDate!.getTime() - first.pubDate!.getTime());
    }
    const selected = sourceOrder || datesComplete ? candidates.slice(0, limit) : candidates;
    const items = await pMap(
        selected,
        async (item) => {
            const path = item.link!.slice(item.link!.lastIndexOf('/') + 1);
            const isNotCollection = !/^\d{4}-\d{2}-\d{2}$/.test(path);
            const itemDetails = isNotCollection ? await getArticleDetail(item.link) : undefined;
            return {
                title: item.title!,
                description: isNotCollection ? itemDetails!.article : item.content,
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                category: isNotCollection ? itemDetails!.categories : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
