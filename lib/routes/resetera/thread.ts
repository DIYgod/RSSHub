import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { compareDates } from '@/utils/time';

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

const handler: Route['handler'] = async (ctx) => {
    const { id } = ctx.req.param();
    const threadRoot = `${BASE}/threads/${id}/`;

    const targetUrl = `${threadRoot}latest`;
    const html = await ofetch<string>(targetUrl);
    const $ = load(html);

    const items = $('article.message')
        .toArray()
        .map((el) => {
            const $el = $(el);

            // Author
            const author = $el.find('.message-author, .username, .message-name a, [itemprop="name"]').first().text();

            // Permanent post link
            const perma = $el.find('.message-attribution-opposite a[href*="#post"]').last().attr('href');
            const link = absolutize(perma, threadRoot);

            // Publication time
            const pubDate = $el.find('time').attr('datetime');

            // Main post content
            const $body = $el.find('.message-body .bbWrapper, .message-content .bbWrapper, .bbWrapper');

            // Remove quoted replies.
            $body.find('.bbCodeBlock--quote, blockquote.bbCodeBlock').remove();
            // Expand spoilers while preserving their content.
            $body.find('.bbCodeBlock--spoiler .bbCodeBlock-title').remove();

            // Collect images after removing quotes.
            const imgs = $body
                .find('img')
                .toArray()
                .map((node) => $(node).attr('src'));

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
        });

    // Sort newest posts first, falling back to publication time.
    items.sort((a, b) => {
        const ida = getPostId(a.link);
        const idb = getPostId(b.link);
        if (idb !== ida) {
            return idb - ida;
        }
        return compareDates(b.pubDate, a.pubDate);
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
