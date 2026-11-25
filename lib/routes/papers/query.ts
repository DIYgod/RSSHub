import type { Language, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';

const pdfUrlGenerators = {
    arxiv: (id: string) => `https://arxiv.org/pdf/${id}.pdf`,
};

const handler = async (ctx) => {
    const { keyword = 'query/Detection' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 150);

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL('arxiv/search?highlight=1&query=&sort=0', rootUrl);
    currentUrl.searchParams.set('query', keyword);
    const feedUrl = new URL('arxiv/search/feed', rootUrl);
    feedUrl.searchParams.set('query', keyword);

    const site = feedUrl.pathname.split('/', 2)[1];
    const feed = await parser.parseURL(feedUrl.href);

    const language: Language = 'en';

    const items = feed.items.slice(0, limit).map((item) => {
        const title = item.title;
        const guid = item.guid;

        const id = item.link?.split(/\//).pop() ?? '';
        const kimiUrl = item.link;
        const pdfUrl = Object.hasOwn(pdfUrlGenerators, site) ? pdfUrlGenerators[site](id) : undefined;

        const authorString = item.author;
        const description = renderDescription({
            pdfUrl,
            kimiUrl,
            summary: item.summary,
        });

        return {
            title: title!,
            description,
            pubDate: parseDate(item.pubDate ?? ''),
            link: item.link,
            category: item.categories,
            author: authorString,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.summary,
            },
            language,
            enclosure_url: pdfUrl,
            enclosure_type: 'application/pdf',
            enclosure_title: title,
        };
    });

    return {
        title: feed.title!,
        description: feed.description,
        link: currentUrl.href,
        item: items,
        image: feed.image?.url,
        language: feed.language,
    };
};

export const route: Route = {
    path: '/query/:keyword{.+}?',
    name: 'Topic',
    url: 'papers.cool',
    maintainers: ['Muyun99'],
    handler,
    example: '/papers/query/Detection',
    parameters: { keyword: 'Keyword to search for papers, e.g., Detection, Segmentation, etc.' },
    description: `::: tip
If you subscibe to [arXiv Paper queryed by Detection](https://papers.cool/arxiv/search?highlight=1\\&query=Detection), where the URL is \`https://papers.cool/arxiv/search?highlight=1&query=Detection\`, extract the part \`https://papers.cool/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/papers/query/Detection\`](https://rsshub.app/papers/query/Detection).
:::

| Category                            | id                 |
| ----------------------------------- | ------------------ |
| arXiv Paper queryed by Detection    | query/Detection    |
| arXiv Paper queryed by Segmentation | query/Segmentation |`,
    categories: ['journal'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            title: 'arXiv Paper queryed by Keyword',
            source: ['papers.cool/arxiv/search?highlight=1&query=*&sort=0'],
            target: '/query/:keyword',
        },
    ],
};
