import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderEssay } from './templates/essay';
import { renderVideo } from './templates/video';

const getImageById = async (id) => {
    const response = await ofetch('https://api.aeonmedia.co/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: 'query getImageById($id: ID!) { image(id: $id) { id url alt caption width height } }',
            variables: { id, site: 'Aeon' },
            operationName: 'getImageById',
        }),
    });

    return response.data.image.url;
};

function format(article) {
    const type = article.type.toLowerCase();

    let block = '';
    let banner: string;
    let authorsBio: string;

    switch (type) {
        case 'film':
            block = renderVideo(article);

            break;

        case 'guide': {
            banner = article.imageSquare?.url;
            authorsBio = article.authors.map((author) => author.bio).join(' ');

            const sectionNames = ['Need To Know', 'What To Do', 'Key Points', 'Learn More', 'Links & Books'];
            const sections = Object.keys(article).filter((key) => key.startsWith('section') && key !== 'section');
            const content = sections
                .map((section) => {
                    const capture = load(article[section]);
                    capture('p.pullquote').remove();
                    const sectionName = sectionNames.shift();
                    return `<h2>${sectionName}</h2>` + capture.html();
                })
                .join('');

            block = renderEssay({ banner, authorsBio, content });

            break;
        }
        case 'idea': {
            banner = article.imageLandscape?.url;
            authorsBio = article.authors.map((author) => author.bio).join(' ');

            const capture = load(article.body);
            capture('p.pullquote').remove();
            block = renderEssay({ banner, authorsBio, content: capture.html() });

            break;
        }
        default:
            break;
    }
    return block;
}

const getData = async (list) => {
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.json);
                const article = data.pageProps.article;
                item.pubDate = new Date(article.publishedAt).toUTCString();
                const content = format(article);
                const capture = load(content);
                await Promise.all(
                    capture('dl > dt')
                        .toArray()
                        .map(async (item) => {
                            const id = capture(item).text();
                            const image = await getImageById(id);
                            capture(item).replaceWith(`<img src="${image}" alt="${id}">`);
                        })
                );

                const authors: string = article.type === 'film' ? article.creditsShort : article.authors.map((author) => author.name).join(', ');

                item.description = capture.html();
                item.author = authors;

                return item;
            })
        )
    );

    return items;
};

export { getData };

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
            const anchor = card.find('a[aria-labelledby]').first();
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
                const response = await ofetch(item.link, { responseType: 'text' });
                const content = load(response);
                const metadata = content('script[type="application/ld+json"]')
                    .toArray()
                    .map((element): ArticleMetadata => JSON.parse(content(element).text()))
                    .find((data) => data['@type'] === 'Article' || data['@type'] === 'VideoObject');
                const sections = content('.article-content');
                if (!sections.length) {
                    throw new Error(`Article body not found at ${item.link}`);
                }
                const body = sections.length > 1 ? copyNodes(sections.first().parent()) : copyNodes(sections);
                body.find('script, style, button, form, nav, [aria-hidden="true"], .pullquote').remove();
                const description = metadata?.embedUrl
                    ? renderVideo({ hosterId: metadata.embedUrl, description: body.html() })
                    : renderEssay({ banner: content('meta[property="og:image"]').attr('content'), content: body.html() ?? undefined });
                const date = metadata?.datePublished ?? metadata?.uploadDate;
                return {
                    description,
                    author: metadata?.author?.map((author) => ({ name: author.name, url: author.url })),
                    pubDate: date ? parseDate(date) : undefined,
                    updated: metadata?.dateModified ? parseDate(metadata.dateModified) : undefined,
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
}

function copyNodes<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, node) => cloneNode(node, true));
    const root = new Document(copy.toArray());
    for (const node of copy) {
        node.parent = root;
    }
    return copy;
}
