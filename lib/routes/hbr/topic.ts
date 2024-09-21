import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:topic?/:type?',
    categories: ['new-media'],
    example: '/hbr/topic/leadership',
    parameters: { topic: 'Topic, can be found in URL, Leadership by default', type: 'Type, see below, Latest by default' },
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
    maintainers: ['nczitzk'],
    handler,
    description: `| LATEST | POPULAR | FROM THE STORE | FOR YOU |
  | ------ | ------- | -------------- | ------- |
  | Latest | Popular | From the Store | For You |

  :::tip
  Click here to view [All Topics](https://hbr.org/topics)
  :::`,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'leadership';
    const type = ctx.req.param('type') ?? 'Latest';

    const rootUrl = 'https://hbr.org';
    const currentUrl = `${rootUrl}/topic/${topic}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

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
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

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
