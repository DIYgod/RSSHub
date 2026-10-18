import { type CheerioAPI, load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function getStructuredData(content: CheerioAPI) {
    return content('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => {
            try {
                const data = JSON.parse(content(element).text());
                const entries = Array.isArray(data) ? data : [data];
                return entries.flatMap((entry) => (entry && typeof entry === 'object' ? [entry, ...(Array.isArray(entry['@graph']) ? entry['@graph'] : [])] : []));
            } catch {
                return [];
            }
        })
        .filter((entry) => entry && typeof entry === 'object');
}

function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }

    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

function getArticleImage(content: CheerioAPI, url: string) {
    const card = content('.cls-card-story')
        .filter((_, element) => content(element).find('a[href]').first().attr('href') === url)
        .first();
    return card.find('img[width="520"]').first().attr('src') ?? card.find('img[width="260"]').first().attr('src');
}

export const route: Route = {
    path: '/news/publisher/:publisher',
    categories: ['new-media'],
    example: '/yahoo/news/publisher/reuters',
    parameters: { publisher: 'Publisher slug from profiles.yahoo.com/brands/:publisher/ (for example reuters, cnn or afp).' },
    name: 'Publisher profiles',
    maintainers: ['DIYgod'],
    radar: [{ source: ['profiles.yahoo.com/brands/:publisher'], target: '/news/publisher/:publisher' }],
    handler,
};

async function handler(ctx): Promise<Data> {
    const publisher = ctx.req.param('publisher');
    const link = `https://profiles.yahoo.com/brands/${encodeURIComponent(publisher)}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const profile = getStructuredData($).find((entry) => entry['@type'] === 'ProfilePage');
    if (!profile) {
        throw new Error(`No public publisher profile was found for ${publisher}.`);
    }

    return {
        title: `Yahoo News - ${profile.mainEntity.name}`,
        language: $('html').attr('lang')?.toLowerCase() === 'en-us' ? 'en-us' : undefined,
        description: profile.mainEntity.description,
        image: profile.mainEntity.logo?.url,
        link,
        item: (profile.hasPart ?? []).map((entry) => {
            const thumbnailUrl = entry.thumbnailUrl ?? getArticleImage($, entry.url);
            return {
                title: entry.headline ?? entry.name,
                link: entry.url,
                author: entry.author?.name,
                pubDate: parsePublicationDate(entry.datePublished || entry.uploadDate),
                image: thumbnailUrl,
                description: renderToString(
                    <>
                        {thumbnailUrl && <img src={thumbnailUrl} alt="" />}
                        {entry.description && <p>{entry.description}</p>}
                    </>
                ),
            };
        }),
    };
}
