import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const baseUrl = 'https://river.to/occasus';
// Reason: the main homepage (/occasus) is severely outdated;
// this sub-page is the real full-site latest feed, updated daily
const defaultFeedPath = 'vncwdhq2xje7wp/rawzi0ruu6p6a1';

export const handler = async (ctx): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 40;

    // Reason: filter supports category/slug or just a slug directly for backward compatibility
    const slug = parseSlug(filter);
    const targetUrl = slug ? `${baseUrl}/${slug}` : `${baseUrl}/${defaultFeedPath}`;

    const { data: response } = await got(targetUrl);

    const $ = load(response);

    const title = $('title').first().text() || '江河日下';

    const items = [...extractFromStreamItems($), ...extractFromMaterialBlocks($, targetUrl), ...extractFromPostPreviews($, targetUrl)];

    // Reason: deduplicate by guid and enforce limit
    const seen = new Set<string>();
    const deduped = items.filter((item) => {
        const key = item.guid || item.title;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });

    return {
        title: `${title} - 江河日下`,
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        link: targetUrl,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content') || '',
        language: 'zh-CN',
        item: deduped.slice(0, limit),
    };
};

/**
 * Parse filter string to get the target slug.
 * Supports: category/slug, tag/slug, or just slug directly.
 */
function parseSlug(filter: string | undefined): string | undefined {
    if (!filter) {
        return undefined;
    }

    const parts = filter.split('/').filter(Boolean);

    // Reason: for backward compatibility, /the/category/rawXXX maps to /occasus/rawXXX
    if (parts.length >= 2 && (parts[0] === 'category' || parts[0] === 'tag')) {
        return parts[1];
    }

    // Direct slug access: /the/rawXXX
    if (parts.length === 1) {
        return parts[0];
    }

    return parts[1] || parts[0];
}

/**
 * Find the first real article link in an element.
 * Reason: only links inside h3/h4 (article title) or wrapping the main image are real article links.
 * Links in author/publication areas (.postMetaInline, .uiScale, avatar containers) are excluded.
 */
function findArticleLink($: CheerioAPI, block: Cheerio<Element>): string | undefined {
    let link: string | undefined;

    // Reason: look for links that contain h3 (title) — these are actual article links
    block.find('a').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');

        if (!href || href === '#Unauthorized' || href === baseUrl || href === `${baseUrl}/` || !href.startsWith('https://river.to/occasus/')) {
            return;
        }

        // Only consider links that wrap article titles (h3) or the main image
        const hasTitle = $el.find('h3').length > 0;
        const isMainImage = $el.hasClass('u-block') && $el.find('.graf-image').length > 0;

        if (hasTitle || isMainImage) {
            link = href;
            return false;
        }
    });

    return link;
}

/**
 * Extract articles from extremePostPreview sections (list items on homepage).
 */
function extractFromStreamItems($: CheerioAPI): DataItem[] {
    const items: DataItem[] = [];

    $('section.extremePostPreview').each((_, el) => {
        const section = $(el);
        const link = findArticleLink($, section);

        if (!link) {
            return;
        }

        const title = section.find('h3 div').first().text().trim();
        const summary = section.find('.u-contentSansThin div, .ui-summary').first().text().trim();
        const dateStr = section.find('time').attr('datetime');
        const tag = section.find('.TagName').attr('title') || '';
        const author = section.find('.uiScale a').first().text().trim();
        const image = section.find('img.graf-image--src').attr('data-srcset');

        if (!title) {
            return;
        }

        const description = renderDescription({
            images: image ? [{ src: image }] : undefined,
            intro: summary || undefined,
        });

        items.push({
            title,
            description,
            pubDate: dateStr ? parseDate(dateStr) : undefined,
            link,
            category: tag ? [tag] : [],
            author,
            guid: link,
        });
    });

    return items;
}

/**
 * Extract articles from material5* blocks (featured cards on category/publication pages).
 * Reason: on category pages, article links are often #Unauthorized (subscriber-only).
 * We still extract the metadata and use the page URL + title hash as guid.
 */
function extractFromMaterialBlocks($: CheerioAPI, pageUrl: string): DataItem[] {
    const items: DataItem[] = [];

    $('[class^="material5"]').each((_, el) => {
        const block = $(el);

        const title = block.find('h3').first().text().trim();
        if (!title) {
            return;
        }

        const summary = block.find('.ui-summary, h4.ui-summary, p.ui-summary').first().text().trim();
        const dateStr = block.find('time').first().attr('datetime');
        const tag = block.find('.TagName').attr('title') || '';
        const author = block.find('.postMetaInline--author').first().text().trim();
        const image = block.find('img.graf-image--src').first().attr('data-srcset');

        // Reason: try to find a real article link; fall back to page URL for subscriber-only content
        const articleLink = findArticleLink($, block);
        const link = articleLink || pageUrl;
        const guid = articleLink || `${pageUrl}#${encodeURIComponent(title)}`;

        const description = renderDescription({
            images: image ? [{ src: image }] : undefined,
            intro: summary || undefined,
        });

        items.push({
            title,
            description,
            pubDate: dateStr ? parseDate(dateStr) : undefined,
            link,
            category: tag ? [tag] : [],
            author,
            guid,
        });
    });

    return items;
}

/**
 * Extract articles from material6Lite streamItem--postPreview blocks.
 * Reason: some category pages (e.g. Beijing) use this list format instead of material5 or extremePostPreview.
 * These are typically subscriber-only articles with #Unauthorized links.
 */
function extractFromPostPreviews($: CheerioAPI, pageUrl: string): DataItem[] {
    const items: DataItem[] = [];

    $('.streamItem--postPreview').each((_, el) => {
        const block = $(el);

        const title = block.find('h3.graf--title').first().text().trim();
        if (!title) {
            return;
        }

        const summary = block.find('h4.ui-summary, .graf--subtitle').first().text().trim();
        const dateStr = block.find('time').first().attr('datetime');
        const author = block.find('.postMetaInline-authorLockup a').first().text().trim();
        const tag = block.find('.TagName').attr('title') || '';
        const image = block.find('img.graf-image--src').not('.avatar-image img').first().attr('data-srcset');

        // Reason: these blocks typically have #Unauthorized links; use page URL as fallback
        const articleLink = findArticleLink($, block);
        const link = articleLink || pageUrl;
        const guid = articleLink || `${pageUrl}#${encodeURIComponent(title)}`;

        const description = renderDescription({
            images: image ? [{ src: image }] : undefined,
            intro: summary || undefined,
        });

        items.push({
            title,
            description,
            pubDate: dateStr ? parseDate(dateStr) : undefined,
            link,
            category: tag ? [tag] : [],
            author,
            guid,
        });
    });

    return items;
}

export const route: Route = {
    path: '/:filter{.+}?',
    name: '分类',
    url: 'river.to',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    example: '/the',
    parameters: { filter: '过滤器，见下方描述' },
    description: `::: tip
如果你想订阅特定类别或出版物，可以在路由中填写 filter 参数。

\`/category/rawj7o4ypewv94\` 可以实现订阅 [时局](https://river.to/occasus/rawj7o4ypewv94) 类别。此时，路由是 [\`/the/category/rawj7o4ypewv94/\`](https://rsshub.app/the/category/rawj7o4ypewv94).

也可以直接使用 slug：[\`/the/rawj7o4ypewv94\`](https://rsshub.app/the/rawj7o4ypewv94)
:::

| 分类                                                | ID                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| [时局](https://river.to/occasus/rawj7o4ypewv94)     | [rawj7o4ypewv94](https://rsshub.app/the/category/rawj7o4ypewv94) |
| [剩余价值](https://river.to/occasus/rawmw7dsta2jew) | [rawmw7dsta2jew](https://rsshub.app/the/category/rawmw7dsta2jew) |
| [Beijing](https://river.to/occasus/rawbcvxkktdkq8)  | [rawbcvxkktdkq8](https://rsshub.app/the/category/rawbcvxkktdkq8) |
| [稳中向好](https://river.to/occasus/raw4krvx85dh27) | [raw4krvx85dh27](https://rsshub.app/the/category/raw4krvx85dh27) |
| [水深火热](https://river.to/occasus/rawtn8jpsc6uvv) | [rawtn8jpsc6uvv](https://rsshub.app/the/category/rawtn8jpsc6uvv) |
| [东升西降](https://river.to/occasus/rawai5kd4z15il) | [rawai5kd4z15il](https://rsshub.app/the/category/rawai5kd4z15il) |
| [大局](https://river.to/occasus/raw2efkzejrsx8)     | [raw2efkzejrsx8](https://rsshub.app/the/category/raw2efkzejrsx8) |
| [境外势力](https://river.to/occasus/rawmpalhnlphuc) | [rawmpalhnlphuc](https://rsshub.app/the/category/rawmpalhnlphuc) |
| [副刊](https://river.to/occasus/rawxght2jr2u5z)     | [rawxght2jr2u5z](https://rsshub.app/the/category/rawxght2jr2u5z) |
| [天高地厚](https://river.to/occasus/rawrsnh9zakqdx) | [rawrsnh9zakqdx](https://rsshub.app/the/category/rawrsnh9zakqdx) |
| [Oyster](https://river.to/occasus/rawdhl9hugdfn9)   | [rawdhl9hugdfn9](https://rsshub.app/the/category/rawdhl9hugdfn9) |`,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['river.to/occasus/:category?'],
            target: (params) => {
                const category = params.category;

                return `/the${category ? `/category/${category}` : ''}`;
            },
        },
        {
            title: '时局',
            source: ['river.to/occasus/rawj7o4ypewv94'],
            target: '/the/category/rawj7o4ypewv94',
        },
        {
            title: '剩余价值',
            source: ['river.to/occasus/rawmw7dsta2jew'],
            target: '/the/category/rawmw7dsta2jew',
        },
        {
            title: 'Beijing',
            source: ['river.to/occasus/rawbcvxkktdkq8'],
            target: '/the/category/rawbcvxkktdkq8',
        },
        {
            title: '稳中向好',
            source: ['river.to/occasus/raw4krvx85dh27'],
            target: '/the/category/raw4krvx85dh27',
        },
        {
            title: '水深火热',
            source: ['river.to/occasus/rawtn8jpsc6uvv'],
            target: '/the/category/rawtn8jpsc6uvv',
        },
        {
            title: '东升西降',
            source: ['river.to/occasus/rawai5kd4z15il'],
            target: '/the/category/rawai5kd4z15il',
        },
        {
            title: '大局',
            source: ['river.to/occasus/raw2efkzejrsx8'],
            target: '/the/category/raw2efkzejrsx8',
        },
        {
            title: '境外势力',
            source: ['river.to/occasus/rawmpalhnlphuc'],
            target: '/the/category/rawmpalhnlphuc',
        },
        {
            title: '副刊',
            source: ['river.to/occasus/rawxght2jr2u5z'],
            target: '/the/category/rawxght2jr2u5z',
        },
        {
            title: '天高地厚',
            source: ['river.to/occasus/rawrsnh9zakqdx'],
            target: '/the/category/rawrsnh9zakqdx',
        },
        {
            title: 'Oyster',
            source: ['river.to/occasus/rawdhl9hugdfn9'],
            target: '/the/category/rawdhl9hugdfn9',
        },
    ],
};
