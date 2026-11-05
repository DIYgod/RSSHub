import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface WordPressTerm {
    id: number;
    name: string;
    taxonomy: string;
}

interface WordPressPost {
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    date_gmt?: string;
    modified_gmt?: string;
    parsely?: { meta?: { author?: Array<{ name?: string }> } };
    _embedded?: {
        'wp:term'?: WordPressTerm[][];
        'wp:featuredmedia'?: Array<{ source_url?: string; alt_text?: string; caption?: { rendered?: string } }>;
    };
}

function renderPost(post: WordPressPost) {
    const image = post._embedded?.['wp:featuredmedia']?.[0];
    return renderToString(
        <>
            {image?.source_url ? (
                <figure>
                    <img src={image.source_url} alt={image.alt_text} />
                    {image.caption?.rendered ? <figcaption>{raw(image.caption.rendered)}</figcaption> : null}
                </figure>
            ) : null}
            {raw(post.content.rendered)}
        </>
    );
}

export const route: Route = {
    path: '/topic/:topic/:language?',
    categories: ['traditional-media'],
    example: '/vice/topic/politics/en',
    parameters: {
        topic: 'Can be found in the URL',
        language: 'defaults to `en`, use the website to discover other codes',
    },
    radar: [
        {
            source: ['www.vice.com/:language/topic/:topic', 'www.vice.com/:language/tag/:topic'],
            target: '/topic/:topic/:language',
        },
    ],
    name: 'Topic',
    maintainers: ['K33k0'],
    handler,
    url: 'vice.com/',
};

async function handler(ctx) {
    const { language = 'en', topic } = ctx.req.param();
    const pageUrl = `https://www.vice.com/${language}/topic/${topic}`;
    const response = await ofetch<string>(pageUrl);
    const $ = load(response);
    const apiUrl = $('link[rel="https://api.w.org/"]').attr('href');
    const tagUrl = $('link[rel="alternate"][type="application/json"]').attr('href');
    if (!apiUrl || !tagUrl) {
        throw new NotFoundError(`No public topic API found for ${language}/${topic}`);
    }
    const [tag, languages] = await Promise.all([ofetch<WordPressTerm>(tagUrl), ofetch<WordPressTerm[]>(new URL('wp/v2/platform-languages', apiUrl).href, { query: { slug: language } })]);
    const languageId = languages[0]?.id;
    if (!tag.id || !languageId) {
        throw new NotFoundError(`No public topic or language found for ${language}/${topic}`);
    }
    const posts = await ofetch<WordPressPost[]>(new URL('wp/v2/posts', apiUrl).href, {
        query: { tags: tag.id, 'platform-languages': languageId, per_page: 12, _embed: 1 },
    });
    return {
        title: `VICE | ${topic} articles`,
        link: $('link[rel="canonical"]').attr('href') ?? pageUrl,
        item: posts.map((post) => ({
            title: load(post.title.rendered).text(),
            link: post.link,
            pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
            updated: post.modified_gmt ? parseDate(`${post.modified_gmt}Z`) : undefined,
            author:
                post.parsely?.meta?.author
                    ?.map((author) => author.name)
                    .filter(Boolean)
                    .join(', ') || undefined,
            category: post._embedded?.['wp:term']
                ?.flat()
                .filter((term) => term.taxonomy === 'category' || term.taxonomy === 'post_tag')
                .map((term) => term.name),
            description: renderPost(post),
        })),
    };
}
