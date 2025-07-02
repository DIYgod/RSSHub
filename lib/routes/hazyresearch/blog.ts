import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/blog', '/'],
    categories: ['blog'],
    example: '/hazyresearch/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hazyresearch.stanford.edu/blog'],
        },
    ],
    name: 'Hazy Research Blog',
    maintainers: ['dvorak0'],
    handler,
    url: 'https://hazyresearch.stanford.edu/blog',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://hazyresearch.stanford.edu';
    const currentUrl = new URL('blog', rootUrl).href;

    const { data: response } = await got(currentUrl);
    const $ = load(response);

    let items = $('section.Blog_post__BYpPm')
        .toArray()
        .slice(0, limit)
        .map((article) => {
            const el = $(article);
            const title = el.find('h2 a').text().trim();
            const link = new URL(el.find('h2 a').attr('href'), rootUrl).href;

            // Get date string, e.g., "Jun 18, 2025"
            const metaText = el.find('p.Blog_meta__6TH_f').text();
            const dateMatch = metaText.match(/[A-Za-z]+ \d{1,2}, \d{4}/);
            const rawDate = dateMatch ? dateMatch[0] : '';

            // Parse and adjust for Stanford timezone offset (e.g., UTC-7)
            let pubDate = parseDate(rawDate);
            if (pubDate) {
                // Offset in minutes: PDT is UTC-7, so add 7 hours to get UTC
                const offsetMinutes = 7 * 60;
                pubDate.setUTCMinutes(pubDate.getUTCMinutes() + offsetMinutes);
            }

            const summary = title;

            return {
                title,
                link,
                pubDate,
                description: summary,
            };
        });

    // Optional: fetch each post for full content
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = load(detailResponse);
                const articleContent = content('main').html() || content('body').html();
                item.description = articleContent;
                return item;
            })
        )
    );

    const feedTitle = $('title').text();
    const author = 'Hazy Research';
    const icon = $('link[rel="icon"]').attr('href');

    return {
        item: items,
        title: `${author} - ${feedTitle}`,
        link: currentUrl,
        description: feedTitle,
        language: 'en',
        icon,
        logo: icon,
        subtitle: feedTitle,
        author,
        allowEmpty: true,
    };
}

