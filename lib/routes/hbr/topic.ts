import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/topic/subject/:topic/:type?', '/topic/:topic?/:type?'],
    categories: ['new-media'],
    example: '/hbr/topic/subject/decision-making-and-problem-solving',
    parameters: {
        topic: 'Topic slug, can be found in the URL. HBR now serves topics under `hbr.org/topic/subject/<slug>`, so use the part after `subject/` (e.g. `decision-making-and-problem-solving`). Leadership by default.',
        type: {
            description: 'Stream, see below, Latest by default',
            options: [
                { value: 'Latest', label: 'Latest' },
                { value: 'From the Store', label: 'From the Store' },
            ],
            default: 'Latest',
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
            source: ['hbr.org/topic/subject/:topic', 'hbr.org/topic/:topic?', 'hbr.org/'],
        },
    ],
    name: 'Topic',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| Latest | From the Store |
| ------ | -------------- |
| Latest | From the Store |

::: tip
HBR now serves topics under \`hbr.org/topic/subject/<slug>\`. Copy the part after \`subject/\` as the \`topic\` parameter. Click here to view [All Topics](https://hbr.org/topics).
:::`,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'leadership';
    const type = ctx.req.param('type') ?? 'Latest';

    const rootUrl = 'https://hbr.org';
    // Mirror HBR's own URL layout: current pages live under /topic/subject/<slug>,
    // legacy ones under /topic/<slug>. Detect which form was requested.
    const isSubject = ctx.req.path.includes('/topic/subject/');
    const currentUrl = `${rootUrl}/topic/${isSubject ? 'subject/' : ''}${topic}`;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    // Each tab is a <stream-content data-stream-name="..."> block. Fall back to
    // the first stream when the requested name is absent, so the route keeps
    // working if HBR renames or reorders the tabs.
    const matched = $(`stream-content[data-stream-name="${type}"]`);
    const container = matched.length ? matched : $('stream-content').first();

    const list = container
        .find('.stream-item')
        .toArray()
        .map((item) => {
            item = $(item);

            const url = item.attr('data-url') ?? '';

            return {
                title: item.attr('data-title'),
                author: item.attr('data-authors'),
                category: item.attr('data-topic'),
                link: url.startsWith('http') ? url : `${rootUrl}${url}`,
            };
        });

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
