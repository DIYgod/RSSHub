import type { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

const link = 'https://thediplomat.com/topics/diplomacy/';
const feedLink = 'https://thediplomat.com/topics/diplomacy/feed/';
const siteUrl = 'https://thediplomat.com/';

export const route: Route = {
    path: '/diplomacy',
    categories: ['traditional-media'],
    example: '/thediplomat/diplomacy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Diplomacy',
    maintainers: ['maxlixiang'],
    radar: [
        {
            source: ['thediplomat.com/topics/diplomacy/'],
            target: '/thediplomat/diplomacy',
        },
    ],
    handler,
};

export async function handler(ctx) {
    const limit = getLimit(ctx);
    const items = await getItems(limit);

    return {
        title: 'The Diplomat - Diplomacy',
        link,
        description: 'Diplomacy articles from The Diplomat.',
        item: items,
    };
}

async function getItems(limit: number) {
    try {
        const html = await ofetch(link, {
            responseType: 'text',
            headers: commonHeaders,
        });

        if (isCloudflareChallenge(html)) {
            throw new Error('The Diplomat topic page returned a Cloudflare challenge.');
        }

        const pageItems = parsePageItems(html, limit);

        if (pageItems.length > 0) {
            return pageItems;
        }
    } catch {
        return getFeedItems(limit);
    }

    return getFeedItems(limit);
}

function parsePageItems(html: string, limit: number) {
    const $ = load(html);
    const seen = new Set<string>();

    return $('a[href]')
        .toArray()
        .flatMap((element) => {
            const anchor = $(element);
            const href = anchor.attr('href');

            if (!href) {
                return [];
            }

            const itemLink = new URL(href, siteUrl).href;

            if (!/^https:\/\/thediplomat\.com\/20\d{2}\/\d{2}\//.test(itemLink) || seen.has(itemLink)) {
                return [];
            }

            const title = normalizeText(anchor.find('h1, h2, h3, h4').first().text() || anchor.attr('title') || anchor.text());

            if (!title) {
                return [];
            }

            seen.add(itemLink);

            const card = anchor.closest('article, li, .post, .story, .article, .td-post-card, div');
            const description = normalizeText(card.find('.dek, .summary, .excerpt, p').first().text());
            const author = normalizeText(card.find('[rel="author"], .author, .byline').first().text()).replace(/^By\s+/i, '');
            const image = normalizeImageUrl(card.find('img').first().attr('data-src') || card.find('img').first().attr('src') || extractSrcset(card.find('img').first().attr('srcset')));

            return [
                {
                    title,
                    link: itemLink,
                    guid: itemLink,
                    description: buildDescription(description, image),
                    ...(author ? { author } : {}),
                    ...(parseDateFromUrl(itemLink) ? { pubDate: parseDateFromUrl(itemLink) } : {}),
                },
            ];
        })
        .slice(0, limit);
}

async function getFeedItems(limit: number) {
    const response = await ofetch(feedLink, {
        responseType: 'text',
        headers: commonHeaders,
    });
    const feed = await parser.parseString(response);

    return feed.items.slice(0, limit).map((item) => {
        const media = getMediaContent(item);
        const image = media?.url || media?.$?.url;
        const description = item['content:encoded'] || item.content || item.summary || item.description || item.contentSnippet || '';
        const pubDate = item.isoDate || item.pubDate || item.updated || item.published;

        return {
            title: item.title,
            link: item.link,
            guid: item.guid || item.link,
            description: buildDescription(description, image),
            author: item.creator || item.author || item['dc:creator'],
            ...(pubDate ? { pubDate: parseDate(pubDate) } : {}),
        };
    });
}

function getMediaContent(item) {
    const media = item['media:content'];

    return Array.isArray(media) ? media[0] : media;
}

function isCloudflareChallenge(html: string) {
    return /cf_chl|cloudflare|enable javascript and cookies|just a moment/i.test(html);
}

function parseDateFromUrl(itemLink: string) {
    const match = /\/(\d{4})\/(\d{2})\//.exec(itemLink);

    if (!match) {
        return;
    }

    const [, year, month] = match;
    return parseDate(`${year}-${month}-01`);
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 20;

    return Number.isFinite(limit) && limit > 0 ? limit : 20;
}

function normalizeText(value?: string) {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeImageUrl(value?: string) {
    if (!value || value.startsWith('data:')) {
        return;
    }

    return new URL(value, siteUrl).href;
}

function extractSrcset(value?: string) {
    return value?.split(',')[0]?.trim().split(/\s+/)[0];
}

function buildDescription(description: string, image?: string) {
    const parts = [];

    if (image) {
        parts.push(`<p><img src="${escapeAttribute(image)}" referrerpolicy="no-referrer"></p>`);
    }

    if (description) {
        parts.push(description);
    }

    return parts.join('\n');
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/"/g, '&quot;');
}

const commonHeaders = {
    referer: siteUrl,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
