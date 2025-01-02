import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import got from '@/utils/got';
import { load } from 'cheerio';

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
    categories: ['traditional-media', 'popular'],
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

    const items = await Promise.all(
        feed.items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30).map(async (item) => {
            const path = item.link.slice(item.link.lastIndexOf('/') + 1);
            const isNotCollection = !/^\d{4}-\d{2}-\d{2}$/.test(path);
            const itemDetails = isNotCollection ? await getArticleDetail(item.link) : null;
            return {
                title: item.title,
                description: isNotCollection ? itemDetails.article : item.content,
                link: item.link,
                guid: item.guid,
                pubDate: item.pubDate,
                category: isNotCollection ? itemDetails.categories : null,
            };
        })
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
