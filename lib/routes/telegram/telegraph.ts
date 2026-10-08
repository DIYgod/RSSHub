import { load } from 'cheerio';
import { createElement } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

type TelegraphNode = string | { tag: string; attrs?: { href?: string; src?: string }; children?: TelegraphNode[] };

const tags = new Set(['a', 'aside', 'b', 'blockquote', 'br', 'code', 'em', 'figcaption', 'figure', 'h3', 'h4', 'hr', 'i', 'iframe', 'img', 'li', 'ol', 'p', 'pre', 's', 'strong', 'u', 'ul', 'video']);

const renderNode = (node: TelegraphNode): ReturnType<typeof createElement> | string => {
    if (typeof node === 'string') {
        return node;
    }
    const attributes: Record<string, string | boolean> = {};
    for (const key of ['href', 'src'] as const) {
        const value = node.attrs?.[key];
        if (!value) {
            continue;
        }
        const url = new URL(value, 'https://telegra.ph');
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            attributes[key] = url.href;
        }
    }
    if (node.tag === 'video') {
        attributes.controls = true;
    }
    return createElement(tags.has(node.tag) ? node.tag : 'span', attributes, ...(node.children ?? []).map((child) => renderNode(child)));
};

export const expandTelegraph = async (description: string) => {
    const $ = load(description, null, false);
    const paths = new Set<string>();
    $('a[href]').each((_, anchor) => {
        try {
            const url = new URL($(anchor).attr('href')!);
            if (['telegra.ph', 'www.telegra.ph'].includes(url.hostname) && url.pathname !== '/') {
                paths.add(url.pathname);
            }
        } catch {
            // Ignore links that do not point to a Telegraph article.
        }
    });
    const articles = await pMap(
        [...paths],
        async (path) => {
            try {
                return await cache.tryGet(`telegram:telegraph:${path}`, async () => {
                    const data = await ofetch<{ ok: boolean; error?: string; result?: { content?: TelegraphNode[] } }>(`https://api.telegra.ph/getPage${path}`, { query: { return_content: true } });
                    if (!data.ok || !data.result?.content) {
                        throw new Error(`Telegraph could not return this article: ${data.error ?? path}`);
                    }
                    return data.result.content.map((node) => renderToString(renderNode(node))).join('');
                });
            } catch {
                // Preserve the original message when a linked article is unavailable.
                return '';
            }
        },
        { concurrency: 1 }
    );
    return (
        description +
        articles
            .filter(Boolean)
            .map((article) => `<hr>${article}`)
            .join('')
    );
};
