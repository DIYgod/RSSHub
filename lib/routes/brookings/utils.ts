import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.brookings.edu';

const commonHeaders = {
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};

const contentPathPattern = /^https:\/\/www\.brookings\.edu\/(?:articles|events|research|commentary|podcasts|books|reports|interactives)\/[^/]+\/?$/;

export async function getBrookingsFeed({ currentUrl, title, description, limit = 25 }) {
    const { data } = await got(currentUrl, {
        headers: commonHeaders,
    });
    const $ = load(data);
    const seen = new Set<string>();

    const links = $('a[href^="https://www.brookings.edu/"]')
        .toArray()
        .map((item) => $(item).attr('href'))
        .filter((link): link is string => Boolean(link && contentPathPattern.test(link)))
        .filter((link) => {
            if (seen.has(link)) {
                return false;
            }
            seen.add(link);
            return true;
        })
        .slice(0, limit);

    const items = await pMap(links, getBrookingsItem, { concurrency: 5 });

    return {
        title,
        link: currentUrl,
        description,
        item: items,
    };
}

async function getBrookingsItem(link: string) {
    return await cache.tryGet(link, async () => {
        const { data } = await got(link, {
            headers: commonHeaders,
        });
        const $ = load(data);
        const ld = parseJsonLd($);
        const title = getMeta($, 'og:title')?.replace(/\s*\|\s*Brookings$/, '') || ld?.headline || $('h1').first().text().trim() || $('title').text().trim();
        const description = getMeta($, 'og:description') || ld?.description || '';
        const image = getMeta($, 'og:image') || getJsonLdImage(ld);
        const pubDate = ld?.datePublished || ld?.dateModified;

        return {
            title,
            link,
            description: [description ? `<p>${description}</p>` : '', image ? `<p><img src="${image}" referrerpolicy="no-referrer"></p>` : ''].join(''),
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            author: getJsonLdAuthor(ld),
        };
    });
}

function getMeta($, name: string) {
    return $(`meta[property="${name}"], meta[name="${name}"]`).attr('content')?.trim();
}

function parseJsonLd($) {
    for (const script of $('script[type="application/ld+json"]').toArray()) {
        try {
            const data = JSON.parse($(script).text());
            const graph = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
            const article = graph.find((item) => ['Article', 'NewsArticle', 'BlogPosting', 'PodcastEpisode', 'Event'].includes(item?.['@type']));
            if (article) {
                return article;
            }
        } catch {
            // ignore invalid JSON-LD blocks
        }
    }
}

function getJsonLdImage(ld) {
    if (!ld?.image) {
        return;
    }
    if (typeof ld.image === 'string') {
        return ld.image;
    }
    if (Array.isArray(ld.image)) {
        return typeof ld.image[0] === 'string' ? ld.image[0] : ld.image[0]?.url;
    }
    return ld.image.url;
}

function getJsonLdAuthor(ld) {
    const author = ld?.author;
    if (!author) {
        return;
    }
    if (typeof author === 'string') {
        return author;
    }
    if (Array.isArray(author)) {
        return author.map((item) => item.name).filter(Boolean).join(', ');
    }
    return author.name;
}

export { rootUrl };
