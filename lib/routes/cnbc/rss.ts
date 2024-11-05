import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/rss/:id?',
    categories: ['traditional-media'],
    example: '/cnbc/rss',
    parameters: { id: 'Channel ID, can be found in Official RSS URL, `100003114` (Top News) by default' },
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
            source: ['www.cnbc.com/id/:id/device/rss/rss.html'],
            target: '/rss/:id',
        },
    ],
    name: 'Full article RSS',
    maintainers: ['TonyRL'],
    handler,
    description: `Provides a better reading experience (full articles) over the official ones.

  Support all channels, refer to [CNBC RSS feeds](https://www.cnbc.com/rss-feeds/).`,
};

async function handler(ctx) {
    const { id = '100003114' } = ctx.req.param();
    const feed = await parser.parseURL(`https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=${id}`);

    const items = await Promise.all(
        feed.items
            .filter((i) => i.link && !i.link.startsWith('https://www.cnbc.com/select/'))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    delete item.content;
                    delete item.contentSnippet;
                    delete item.isoDate;

                    item.description = '';
                    if ($('.RenderKeyPoints-keyPoints').length) {
                        $('.RenderKeyPoints-keyPoints').html();
                    }
                    if ($('.FeaturedContent-articleBody').length) {
                        item.description += $('.FeaturedContent-articleBody').html();
                    }
                    if ($('.ArticleBody-articleBody').length) {
                        item.description += $('.ArticleBody-articleBody').html();
                    }
                    if ($('.LiveBlogBody-articleBody').length) {
                        item.description += $('.LiveBlogBody-articleBody').html();
                    }
                    if ($('.ClipPlayer-clipPlayer').length) {
                        item.description += $('.ClipPlayer-clipPlayer').html();
                    }

                    const meta = JSON.parse($('[type=application/ld+json]').last().text());
                    item.author = meta.author ? (meta.author.name ?? meta.author.map((a) => a.name).join(', ')) : null;
                    item.category = meta.keywords;

                    return item;
                })
            )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
    };
}
