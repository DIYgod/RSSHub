import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const BASE = 'https://www.resetera.com';

const absolutize = (u?: string, root = BASE) => {
    if (!u) {
        return u;
    }
    if (u.startsWith('#')) {
        return root + u;
    }
    if (u.startsWith('//')) {
        return 'https:' + u;
    }
    if (u.startsWith('/')) {
        return BASE + u;
    }
    return u;
};

// Extract post IDs for sorting.
const getPostId = (link?: string) => Number(link?.match(/post-(\d+)/)?.[1] || 0);

// Choose the first image from a srcset.
const pickFromSrcset = (v?: string) =>
    v
        ? v
              .split(',')
              .map((s) => s.trim().split(' ', 1)[0])
              .find(Boolean)
        : undefined;

const handler: Route['handler'] = async (ctx) => {
    const { id } = ctx.req.param();
    const threadRoot = `${BASE}/threads/${id}/`;

    const targetUrl = `${threadRoot}latest`;
    const html = await ofetch<string>(targetUrl);
    const $ = load(html);

    const seen = new Set<string>();
    const items = $('article.message')
        .toArray()
        .map((el) => {
            const $el = $(el);

            // Author
            const author = $el.find('.message-author, .username, .message-name a, [itemprop="name"]').first().text().trim() || '';

            // Permanent post link
            const perma = $el.find('.message-attribution-opposite a[href*="/post-"]').last().attr('href') || $el.find('.message-attribution-opposite a[href*="#post"]').last().attr('href') || '';
            const link = perma ? absolutize(perma, threadRoot) : targetUrl;
            if (!link || seen.has(link)) {
                return null;
            }
            seen.add(link);

            // Publication time
            const timeEl = $el.find('time').first();
            const dataTime = Number(timeEl.attr('data-time') || 0);
            const pubDate = timeEl.attr('datetime') || (dataTime ? new Date(dataTime * 1000).toUTCString() : undefined);

            // Main post content
            const $body = $el.find('.message-body .bbWrapper, .message-content .bbWrapper, .bbWrapper');

            // Remove quoted replies.
            $body.find('.bbCodeBlock--quote, blockquote.bbCodeBlock').remove();
            // Expand spoilers while preserving their content.
            $body.find('.bbCodeBlock--spoiler .bbCodeBlock-title').remove();

            // Collect images after removing quotes.
            const imgs = $body
                .find('img, picture source')
                .toArray()
                .map((node) => {
                    const $n = $(node);
                    const src = $n.attr('src') || $n.attr('data-src') || $n.attr('data-original') || $n.attr('data-url') || pickFromSrcset($n.attr('srcset')) || pickFromSrcset($n.attr('data-srcset'));
                    return absolutize(src || '', threadRoot);
                })
                .filter((u): u is string => !!u);

            const hasImage = imgs.length > 0;

            // Render images separately from the post text.
            $body.find('img, picture').remove();
            const textHtml = ($body.html() || '').trim();

            // Combine author and post number.
            const floor = $el.find('.message-attribution-opposite a').last().text().trim();
            const title = author ? `${author}${floor ? ' - ' + floor : ''}` : floor || 'New post';

            // Main content and images
            const imagesHtml = hasImage ? imgs.map((u) => `<p><img src="${u}" /></p>`).join('') : '';
            const description = `
                    <p><a href="${link}">🔗 Source post</a></p>
                    ${textHtml}${imagesHtml}
                `;

            return {
                title,
                link,
                guid: link,
                description,
                author,
                pubDate,
                category: hasImage ? ['image'] : undefined,
            };
        })
        .filter((post) => post !== null);

    // Sort newest posts first, falling back to publication time.
    items.sort((a, b) => {
        const ida = getPostId(a.link);
        const idb = getPostId(b.link);
        if (idb !== ida) {
            return idb - ida;
        }
        const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return tb - ta;
    });

    const title = $('h1').text().trim() || `ResetEra Thread ${id}`;

    return {
        title,
        link: targetUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/thread/:id',
    name: 'Thread latest posts (text & images)',
    url: 'resetera.com',
    example: '/resetera/thread/1076160',
    parameters: {
        id: 'Numeric thread ID or the slug.ID identifier from the thread URL',
    },
    maintainers: ['ZEN-GUO'],
    categories: ['bbs'],
    radar: [
        {
            source: ['resetera.com/threads/:id/:page?'],
            target: '/thread/:id',
        },
    ],
    handler,
};
