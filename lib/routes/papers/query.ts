import path from 'node:path';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import parser from '@/utils/rss-parser';

const pdfUrlGenerators = {
    arxiv: (id: string) => `https://arxiv.org/pdf/${id}.pdf`,
};

export const handler = async (ctx) => {
    const { keyword = 'query/Detection' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 150;

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL(`arxiv/search?highlight=1&query=${keyword}&sort=0`, rootUrl).href;
    const feedUrl = new URL(`arxiv/search/feed?query=${keyword}`, rootUrl).href;

    const site = keyword.split(/\//)[0];
    const apiKimiUrl = new URL(`${site}/kimi?paper=`, rootUrl).href;
    const feed = await parser.parseURL(feedUrl);

    const language = 'en';

    const items = feed.items.slice(0, limit).map((item) => {
        const title = item.title;
        const guid = item.guid;

        const id = item.link?.split(/\//).pop() ?? '';
        const kimiUrl = new URL(id, apiKimiUrl).href;
        const pdfUrl = Object.hasOwn(pdfUrlGenerators, site) ? pdfUrlGenerators[site](id) : undefined;

        const authorString = item.author;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            pdfUrl,
            siteUrl: item.link,
            kimiUrl,
            authorString,
            summary: item.summary,
        });

        return {
            title,
            description,
            pubDate: parseDate(item.pubDate ?? ''),
            link: item.link,
            category: item.categories,
            author: authorString,
            doi: `${site}${id}`,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.content,
            },
            language,
            enclosure_url: pdfUrl,
            enclosure_type: 'application/pdf',
            enclosure_title: title,
        };
    });

    return {
        title: feed.title,
        description: feed.description,
        link: currentUrl,
        item: items,
        allowEmpty: true,
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
  If you subscibe to [arXiv Paper queryed by Detection](https://papers.cool/arxiv/search?highlight=1&query=Detection), where the URL is \`https://papers.cool/arxiv/search?highlight=1&query=Detection\`, extract the part \`https://papers.cool/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/papers/query/Detection\`](https://rsshub.app/papers/query/Detection).
:::

| Category                                              | id                  |
| ----------------------------------------------------- | ------------------- |
| arXiv Paper queryed by Detection                      | query/Detection     |
| arXiv Paper queryed by Segmentation                   | query/Segmentation  |
  `,
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
            target: '/papers/query/:keyword',
        },
    ],
};
