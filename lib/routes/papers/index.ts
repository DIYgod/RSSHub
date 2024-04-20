import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import parser from '@/utils/rss-parser';

const pdfUrlGenerators = {
    arxiv: (id: string) => `https://arxiv.org/pdf/${id}.pdf`,
};

export const handler = async (ctx) => {
    const { category = 'arxiv/cs.AI' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 150;

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL(category, rootUrl).href;
    const feedUrl = new URL(`${category}/feed`, rootUrl).href;

    const site = category.split(/\//)[0];
    const apiKimiUrl = new URL(`${site}/kimi/`, rootUrl).href;

    const feed = await parser.parseURL(feedUrl);

    const language = 'en';

    const items = feed.items.slice(0, limit).map((item) => {
        const title = item.title;
        const guid = item.guid;

        const id = item.link?.split(/\//).pop() ?? '';
        const kimiUrl = new URL(id, apiKimiUrl).href;
        const pdfUrl = Object.hasOwn(pdfUrlGenerators, site) ? pdfUrlGenerators[site](id) : undefined;

        const description = art(path.join(__dirname, 'templates/description.art'), {
            pdfUrl,
            siteUrl: item.link,
            kimiUrl,
            summary: item.summary,
        });

        return {
            title,
            description,
            pubDate: parseDate(item.pubDate ?? ''),
            link: item.link,
            category: item.categories,
            author: item.creator,
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
    path: '/:category{.+}?',
    name: 'Topic',
    url: 'papers.cool',
    maintainers: ['nczitzk'],
    handler,
    example: '/papers/arxiv/cs.AI',
    parameters: { category: 'Category, arXiv Artificial Intelligence (cs.AI) by default' },
    description: `:::tip
  If you subscribe to [arXiv Artificial Intelligence (cs.AI)](https://papers.cool/arxiv/cs.AI)，where the URL is \`https://papers.cool/arxiv/cs.AI\`, extract the part \`https://papers.cool/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/papers/arxiv/cs.AI\`](https://rsshub.app/papers/arxiv/cs.AI).
  :::

  | Category                                              | id          |
  | ----------------------------------------------------- | ----------- |
  | arXiv Artificial Intelligence (cs.AI)                 | arxiv/cs.AI |
  | arXiv Computation and Language (cs.CL)                | arxiv/cs.CL |
  | arXiv Computer Vision and Pattern Recognition (cs.CV) | arxiv/cs.CV |
  | arXiv Machine Learning (cs.LG)                        | arxiv/cs.LG |
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
            title: 'arXiv Artificial Intelligence (cs.AI)',
            source: ['papers.cool/arxiv/cs.AI'],
            target: '/arxiv/cs.AI',
        },
        {
            title: 'arXiv Computation and Language (cs.CL)',
            source: ['papers.cool/arxiv/cs.CL'],
            target: '/arxiv/cs.CL',
        },
        {
            title: 'arXiv Computer Vision and Pattern Recognition (cs.CV)',
            source: ['papers.cool/arxiv/cs.CV'],
            target: '/arxiv/cs.CV',
        },
        {
            title: 'arXiv Machine Learning (cs.LG)',
            source: ['papers.cool/arxiv/cs.LG'],
            target: '/arxiv/cs.LG',
        },
    ],
};
