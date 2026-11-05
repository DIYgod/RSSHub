import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import type { BBobCoreTagNodeTree, TagNodeObject } from '@bbob/types';
import { load } from 'cheerio';
import { escapeText } from 'entities';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tribalfootball.com/';
const apiUrl = 'https://2015.ds.lsapp.eu/pq_graphql';
const projectId = '2015';
type Article = {
    id: string;
    title: string;
    slug: string;
    content: string;
    perex?: string;
    publishedAt?: number;
    editedAt?: number | null;
    credit?: string;
    author?: string;
    images: Array<{
        url: string;
        altText?: string;
        variantTypeId: number;
    }>;
    translatedTags: Array<{
        label: string;
    }>;
};
function renderSourceLink(node: TagNodeObject): TagNodeObject {
    const href = node.attrs?.['cms-href'] ?? node.attrs?.href;
    return { tag: 'a', attrs: { href: typeof href === 'string' ? href : undefined }, content: node.content };
}
function renderSourceEmbed(node: TagNodeObject): TagNodeObject {
    const url = node.attrs?.url;
    return { tag: 'a', attrs: { href: typeof url === 'string' ? url : undefined }, content: typeof url === 'string' ? url : node.content };
}
const sourcePreset = presetHTML5.extend((tags) => ({
    ...tags,
    p: (node: TagNodeObject): TagNodeObject => ({ tag: 'p', content: node.content }),
    a: renderSourceLink,
    'lslink-participant': renderSourceLink,
    'lslink-player': renderSourceLink,
    'lslink-competition': renderSourceLink,
    'lslink-event': renderSourceLink,
    embed: renderSourceEmbed,
}));
function escapeSourceText(tree: BBobCoreTagNodeTree) {
    return tree.walk((node) => (typeof node === 'string' ? escapeText(node) : node));
}
function createArticlePreset(inlineImages: Map<string, string>) {
    return sourcePreset.extend((tags) => ({
        ...tags,
        image: (node: TagNodeObject): TagNodeObject => {
            const id = node.attrs?.id;
            const src = typeof id === 'string' ? inlineImages.get(id) : undefined;
            if (!src) {
                throw new Error('Tribal Football did not provide a URL for an inline article image. Please try again later.');
            }
            const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
            const credit = typeof node.attrs?.['credit-line'] === 'string' ? node.attrs['credit-line'] : '';
            return {
                tag: 'figure',
                content: [
                    { tag: 'img', attrs: { alt }, content: [src] },
                    ...(alt || credit
                        ? [
                              {
                                  tag: 'figcaption',
                                  content: [
                                      { tag: 'span', content: [alt] },
                                      { tag: 'span', content: [credit] },
                                  ],
                              },
                          ]
                        : []),
                ],
            };
        },
    }))();
}
async function fetchInlineImages(link: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const images = new Map<string, string>();
    $('[data-testid="fp-newsArticle-body"] img[src]').each((_, element) => {
        const src = $(element).attr('src');
        if (!src) {
            return;
        }
        const url = new URL(src, link);
        const id = url.pathname
            .split('/')
            .pop()
            ?.replace(/\.[^.]+$/, '');
        if (!id) {
            return;
        }
        images.set(id, url.href);
    });
    return images;
}
async function fetchArticle(id: string): Promise<DataItem> {
    const response = await ofetch<{
        data: {
            findCatArticleById: Article;
        };
    }>(apiUrl, { query: { _hash: 'na', articleId: id, projectId } });
    const article = response.data.findCatArticleById;
    const link = new URL(`article/${article.slug}-${article.id}`, rootUrl).href;
    const image = article.images.find((image) => image.variantTypeId === 4) ?? article.images.find((image) => image.variantTypeId === 3) ?? article.images[0];
    const inlineImages = /\[image(?:\s|\])/.test(article.content) ? await fetchInlineImages(link) : new Map<string, string>();
    const content = bbobHTML(article.content, [createArticlePreset(inlineImages), escapeSourceText]);
    return {
        title: article.title,
        link,
        guid: article.id,
        pubDate: article.publishedAt === undefined ? undefined : parseDate(article.publishedAt * 1000),
        updated: isNullish(article.editedAt) ? undefined : parseDate(article.editedAt * 1000),
        author: article.credit || article.author,
        category: article.translatedTags.map((tag) => tag.label),
        image: image?.url,
        description: renderToString(
            <>
                {image ? <img src={image.url} alt={image.altText} /> : null}
                {article.perex ? <p>{article.perex}</p> : null}
                {raw(content)}
            </>
        ),
    };
}
export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/tribalfootball',
    radar: [
        {
            source: ['tribalfootball.com/'],
            target: '',
        },
    ],
    name: 'Latest News',
    maintainers: ['Rongronggg9'],
    handler,
    url: 'tribalfootball.com/',
};
async function handler() {
    const response = await ofetch<{
        data: {
            findNewsLayoutByProjectId: {
                sections: Array<{
                    title: string;
                    sectionType: string;
                    articles: Array<{
                        id: string;
                    }>;
                }>;
            };
        };
    }>(apiUrl, { query: { _hash: 'nl', projectId } });
    const latest = response.data.findNewsLayoutByProjectId.sections.find((section) => section.sectionType === 'MOST_RECENT' && /^MOST RECENT\s*$/i.test(section.title));
    const items = await pMap(latest?.articles ?? [], (article) => cache.tryGet(`tribalfootball:article:v3:${article.id}`, () => fetchArticle(article.id)), { concurrency: 3, stopOnError: false });
    return {
        title: 'Tribal Football - Latest',
        description: 'Tribal Football - Football News, Soccer News, Transfers & Rumours',
        link: rootUrl,
        item: items,
    };
}
function isNullish(value: unknown): value is null | undefined {
    return isOneOf(value, [null, undefined]);
}
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
