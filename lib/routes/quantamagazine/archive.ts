import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.quantamagazine.org';

const processArticleContent = (html: string | null, articleLink?: string): string => {
    if (!html) {
        return '';
    }

    // Handle LaTeX formulas
    let processed = html.replaceAll(/\$latex([\S\s]+?)\$/g, '<img align="center" src="https://latex.codecogs.com/png.latex?$1"/>');

    // Handle embedded images with captions
    processed = processed.replaceAll(/<div id=[\S\s]+?"src":"(https?:?[\S\s]+?)",[\S\s]+?"caption":"([\S\s]*?)",[\S\s]+?<\/div>?/g, (_match, src, cap) => {
        const imgUrl = src.replaceAll(/\\([^nu])/g, '$1');
        const img = `<img src="${imgUrl}" />`;

        const noBS = cap.replaceAll(/\\([^nu])/g, '$1');
        const removeNL = noBS.replaceAll(String.raw`\n`, '');
        const caption = removeNL.replaceAll(/\\u(\d{1,3}[a-z]\d?|\d{4}?)/g, (_omit, s) => String.fromCodePoint(Number.parseInt(s, 16)));

        return `<figure>${img}<figcaption>${caption}</figcaption></figure>`;
    });

    // Handle lottie-player animations
    // Multiple lottie-players might exist (desktop/mobile versions) - replace all with placeholders first
    const lottieMatches = [...processed.matchAll(/<lottie-player[^>]*src="([^"]+)"[^>]*><\/lottie-player>/g)];
    const uniqueAnimations = new Set();

    // Replace each lottie-player, but track unique animations by filename
    for (const match of lottieMatches) {
        const src = match[1];
        // Extract animation name (without Desktop/Mobile suffix)
        const animName =
            src
                .split('/')
                .pop()
                ?.replace(/-(Desktop|Mobile).*\.json$/, '') || 'animation';

        if (uniqueAnimations.has(animName)) {
            // Duplicate (mobile/desktop variant): just remove it
            processed = processed.replace(match[0], '');
        } else {
            // First occurrence: replace with badge that links to the article
            uniqueAnimations.add(animName);
            const linkUrl = articleLink || rootUrl;
            const badgeImg = 'https://img.shields.io/badge/🎬-View_Interactive_Animation-0066CC?style=for-the-badge';
            const replacement = `<p style="text-align: center; margin: 20px 0;"><a href="${linkUrl}" target="_blank"><img src="${badgeImg}" alt="View Interactive Animation" /></a></p>`;
            processed = processed.replace(match[0], replacement);
        }
    }

    return processed;
};

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = `${rootUrl}/wp-json/wp/v2/posts`;
    const posts = await ofetch(apiUrl, {
        query: {
            per_page: limit,
            page: 1,
            _embed: 'author',
        },
    });

    const items = await Promise.all(
        posts.map((item) =>
            cache.tryGet(item.link, async () => {
                // Get author name from embedded data
                const authorName = item._embedded?.author?.[0]?.name || '';

                // Fetch full article content from the page
                const response = await ofetch(item.link, {
                    parseResponse: (txt) => txt,
                });
                const $ = load(response);

                // Remove unnecessary elements
                $('.header-spacer, .scale1.mha, .post__title__author-date, .post__aside--divider').remove();
                $('.hide-on-print, .post__aside__pullquote, aside.post__sidebar.hide, nav[data-glide-el]').remove();
                $('.post__footer, .post__title__author-date').remove();
                // Remove video placeholder images (the poster is already in the video element)
                $('.iframe-placeholder').remove();

                const contents = processArticleContent($('#postBody').html(), item.link);

                return {
                    title: item.title.rendered,
                    author: authorName,
                    description: contents,
                    link: item.link,
                    guid: item.link,
                    pubDate: parseDate(item.date),
                };
            })
        )
    );

    return {
        title: 'Quanta Magazine',
        link: rootUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/archive',
    name: 'Archive',
    url: 'quantamagazine.org',
    maintainers: ['emdoe'],
    handler,
    example: '/quantamagazine/archive',
    parameters: {},
    description: 'Get the latest articles from Quanta Magazine.',
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['quantamagazine.org'],
            target: '/archive',
        },
    ],
};
