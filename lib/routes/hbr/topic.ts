import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:topic?/:type?',
    categories: ['new-media', 'popular'],
    example: '/hbr/topic/Leadership/Popular',
    parameters: {
        topic: 'Topic, can be found in URL, Leadership by default',
        type: {
            description: 'Type, see below, Popular by default',
            options: [
                { value: 'Popular', label: 'Popular' },
                { value: 'From the Store', label: 'From the Store' },
                { value: 'For You', label: 'For You' },
            ],
            default: 'Popular',
        },
    },
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
            source: ['hbr.org/topic/:topic?', 'hbr.org/'],
        },
    ],
    name: 'Topic',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| POPULAR | FROM THE STORE | FOR YOU |
  | ------- | -------------- | ------- |
  | Popular | From the Store | For You |

::: tip
  Click here to view [All Topics](https://hbr.org/topics)
:::`,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'Leadership';
    const type = ctx.req.param('type') ?? 'Popular';

    const rootUrl = 'https://hbr.org';
    const currentUrl = `${rootUrl}/topic/${topic}`;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $(`stream-content[data-stream-name="${type}"]`)
        .find('.stream-item')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.attr('data-title'),
                author: item.attr('data-authors'),
                category: item.attr('data-topic'),
                link: `${rootUrl}${item.attr('data-url')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const content = load(detailResponse);

                item.description = content('.article-body, article[itemprop="description"]').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

                return item;
            })
        )
    );

    return {
        title: `${$('title').eq(0).text()} - ${type}`,
        link: currentUrl,
        item: items,
    };
}
