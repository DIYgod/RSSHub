import { Buffer } from 'node:buffer';

import { config } from '@/config';
import type { Language, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

import { renderDescription } from './templates/description';

const rssEncodings = new Set<BufferEncoding>(['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex']);
const rssEncodingAliases: Record<string, BufferEncoding> = { 'utf-8': 'utf8', 'iso-8859-1': 'latin1' };

export const getRssFeed = async (feedUrl: string, redirectCount = 0): Promise<Awaited<ReturnType<typeof parser.parseString>>> => {
    const response = await ofetch.raw<ArrayBuffer, 'arrayBuffer'>(feedUrl, {
        method: 'GET',
        headers: { Accept: 'application/rss+xml', 'User-Agent': config.ua },
        responseType: 'arrayBuffer',
        redirect: 'manual',
        ignoreResponseError: true,
        timeout: config.requestTimeout,
    });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
        if (redirectCount === 5) {
            throw new Error('Too many redirects');
        }
        return getRssFeed(new URL(location, feedUrl).href, redirectCount + 1);
    }
    if (response.status >= 300) {
        throw new Error(`Status code ${response.status}`);
    }
    const charset =
        response.headers
            .get('content-type')
            ?.match(/(encoding|charset)\s*=\s*(\S+)/)?.[2]
            .toLowerCase() || '';
    const encoding = rssEncodingAliases[charset] || (rssEncodings.has(charset as BufferEncoding) ? (charset as BufferEncoding) : 'utf8');
    return parser.parseString(Buffer.from(response._data!).toString(encoding));
};

const pdfUrlGenerators = {
    arxiv: (id: string) => `https://arxiv.org/pdf/${id}.pdf`,
};

const getPublicationDate = (value: unknown): Date | undefined => {
    if ((typeof value !== 'string' || !/\S/.test(value)) && typeof value !== 'number') {
        return undefined;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

export const handler = async (ctx) => {
    const { keyword = 'query/Detection' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 150);

    const rootUrl = 'https://papers.cool';
    const currentUrl = new URL('arxiv/search?highlight=1&query=&sort=0', rootUrl);
    currentUrl.searchParams.set('query', keyword);
    const feedUrl = new URL('arxiv/search/feed', rootUrl);
    feedUrl.searchParams.set('query', keyword);

    const site = feedUrl.pathname.split('/', 2)[1];
    const feed = await getRssFeed(feedUrl.href);

    const language: Language = 'en';

    const items = feed.items.slice(0, limit).map((item) => {
        const title = item.title;
        const guid = item.guid;

        const id = item.link?.split(/\//).pop() ?? '';
        const kimiUrl = item.link;
        const pdfUrl = id && Object.hasOwn(pdfUrlGenerators, site) ? pdfUrlGenerators[site](id) : undefined;

        const authorString = item.author;
        const description = renderDescription({
            pdfUrl,
            kimiUrl,
            summary: item.summary,
        });

        return {
            title: title!,
            description,
            pubDate: getPublicationDate(item.pubDate),
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
