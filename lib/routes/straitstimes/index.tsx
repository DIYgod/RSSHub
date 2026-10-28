import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:section?',
    categories: ['traditional-media'],
    example: '/straitstimes/singapore',
    parameters: {
        category: 'Category, see below for more information',
        section: 'Section, see below for more information',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'News',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `| Category              | \`:category\`               |   |
| --------------------- | ------------------------- | - |
| Singapore             | \`singapore\`               |   |
| Asia                  | \`asia\`                    |   |
| World                 | \`world\`                   |   |
| Opinion               | \`opinion\`                 |   |
| Life                  | \`life\`                    |   |
| Business              | \`business\`                |   |
| Jobs                  | \`jobs\`                    |   |
| Parenting & Education | \`parenting-and-education\` |   |
| Food                  | \`food\`                    |   |
| Tech                  | \`tech\`                    |   |
| Sport                 | \`sport\`                   |   |
| Podcasts              | \`podcasts\`                | , |

| Section     | \`:section\`    |
| ----------- | ------------- |
| Top Stories | \`top-stories\` |
| Latest      | \`latest\`      |`,
    radar: [
        {
            source: ['www.straitstimes.com/:category'],
            target: '/:category',
        },
        {
            source: ['www.straitstimes.com'],
            target: '/',
        },
    ],
};

async function handler(ctx) {
    const category = ctx.req.param('category') ? ctx.req.param('category').toLowerCase() : 'singapore';
    const section = ctx.req.param('section')?.toLowerCase();
    const baseUrl = 'https://www.straitstimes.com';
    const currentUrl = new URL(`/${category}`, baseUrl).href;
    const { data: response } = await got(currentUrl);
    const $ = load(response);
    const refCode = section === 'top-stories' ? 'top-stories' : 'latest';
    const seen = new Set<string>();
    const list: Array<DataItem & { link: string }> = $('a[href]')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const url = new URL(anchor.attr('href') || '', baseUrl);
            if (url.searchParams.get('ref') !== refCode) {
                return [];
            }
            url.search = '';
            if (seen.has(url.href)) {
                return [];
            }
            seen.add(url.href);
            return {
                title: anchor.find('[data-testid="heading-test-id"]').first().text(),
                link: url.href,
                image: anchor.find('img').first().attr('src'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`straitstimes:article:v3:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const content = load(response);
                const body = content('.storyline-wrapper').first();
                body.find('.more-on-this-topic-wrapper').remove();
                const description = (content('.hero-media-wrapper').first().html() ?? '') + (body.html() ?? '');
                const liveBlogId = content('.live-blog-coverage')
                    .attr('data-testid')
                    ?.match(/^live-coverage-test-id-(\d+)$/)?.[1];
                if (!description && liveBlogId) {
                    const entries = await ofetch<LiveBlogEntry[]>(`https://liveblog.straitstimes.com/Feed/view/${liveBlogId}`, { responseType: 'json' });
                    const liveContent = entries.map((entry) => entry.item_content ?? '').join('');
                    if (!liveContent) {
                        throw new NotFoundError(`No readable live updates are available at ${item.link}`);
                    }
                    const schema = getLiveBlogSchema(content);
                    return {
                        description: liveContent,
                        author:
                            content('.live-blog-header .st-byline')
                                .filter((_, element) => content(element).text().startsWith('Edited by:'))
                                .text()
                                .replace(/^Edited by:\s*/, '') || undefined,
                        pubDate: schema?.datePublished ? parseDate(schema.datePublished) : undefined,
                        updated: schema?.dateModified ? parseDate(schema.dateModified) : undefined,
                    };
                }
                if (!description) {
                    throw new NotFoundError(`No readable article content is available at ${item.link}`);
                }
                const published = content('meta[property="article:published_time"]').attr('content');
                const modified = content('meta[property="article:modified_time"]').attr('content');
                return {
                    description,
                    author: content('meta[property="article:author"]').attr('content'),
                    category: content('[data-testid="tags-test-id"] [data-testid="topic-tag-content-test-id"]')
                        .toArray()
                        .map((element) => content(element).text()),
                    pubDate: published ? parseDate(published) : undefined,
                    updated: modified ? parseDate(modified) : undefined,
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: `The Straits Times - ${category.replaceAll('-', ' ').toUpperCase()}`,
        link: currentUrl,
        item: items,
    };
}

interface LiveBlogEntry {
    item_content?: string;
}

interface LiveBlogSchema {
    '@type': string;
    datePublished?: string;
    dateModified?: string;
}

function getLiveBlogSchema($: CheerioAPI): LiveBlogSchema | undefined {
    return $('main script[type="application/ld+json"]')
        .toArray()
        .map((element): LiveBlogSchema => JSON.parse($(element).text()))
        .find((schema) => schema['@type'] === 'LiveBlogPosting');
}
