import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { renderEssay } from './templates/essay';
import { renderVideo } from './templates/video';

interface ArticleMetadata {
    '@type': string;
    datePublished?: string;
    dateModified?: string;
    uploadDate?: string;
    author?: Array<{ name: string; url?: string }>;
    embedUrl?: string;
}

export function getHtmlData($: CheerioAPI) {
    const list = $('main article')
        .toArray()
        .map((element) => {
            const card = $(element);
            const anchor = card.find('a[aria-labelledby]');
            const href = anchor.attr('href');
            const titleId = anchor.attr('aria-labelledby');
            return href && titleId ? { title: card.find(`[id="${titleId}"]`).text(), link: new URL(href, 'https://psyche.co').href } : undefined;
        })
        .filter((item) => item !== undefined)
        .filter((item, index, items) => items.findIndex((other) => other.link === item.link) === index);

    return pMap(
        list,
        async (item): Promise<DataItem> => {
            const details = await cache.tryGet(`${item.link}:psyche-html`, async () => {
                const response = await ofetch(item.link);
                const content = load(response);
                const metadata: ArticleMetadata = JSON.parse(content('script[type="application/ld+json"]:contains(\'"@type":"Article"\'), script[type="application/ld+json"]:contains(\'"@type":"VideoObject"\')').text());
                const sections = content('.article-content');
                const body = sections.length > 1 ? sections.first().parent() : sections;
                body.find('button, .pullquote').remove();
                const description = metadata.embedUrl
                    ? renderVideo({ hosterId: metadata.embedUrl, description: body.html() })
                    : renderEssay({ banner: content('meta[property="og:image"]').attr('content'), content: body.html() ?? undefined });
                const date = metadata.datePublished ?? metadata.uploadDate;
                return {
                    description,
                    author: metadata.author?.map((author) => ({ name: author.name, url: author.url })),
                    pubDate: date ? parseDate(date) : undefined,
                    updated: metadata.dateModified ? parseDate(metadata.dateModified) : undefined,
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
}
