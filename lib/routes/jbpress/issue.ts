import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function handler() {
    const rootUrl = 'https://jbpress.ismedia.jp';
    const response = await got(rootUrl);
    const html = response.data as string;

    // Example regex for extracting articles - adapt as needed!
    const articleRegex = /<a[^>]+class="c-card__title-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<time[^>]+class="c-card__date"[^>]*>(.*?)<\/time>/g;

    const items: any[] = [];
    let match;
    while ((match = articleRegex.exec(html)) !== null && items.length < 15) {
        const link = rootUrl + match[1];
        // Use .replace, not .replaceAll, and only with a regex for safety and compatibility
        const title = match[2].replaceAll(/<[^>]+>/g, '').trim();
        const pubDate = parseDate(match[3].trim());

        items.push({
            title,
            link,
            pubDate,
            description: '', // Optionally fetch article content for more detail
        });
    }

    return {
        title: 'JBpress 最新記事',
        link: rootUrl,
        item: items,
    };
}

export const route: Route = {
    path: '/',
    categories: ['blog', 'traditional-media'],
    example: '/jbpress',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Latest Articles',
    maintainers: ['Hrushikesh9807'],
    handler,
    url: 'jbpress.ismedia.jp',
    description: 'JBpress homepage latest news articles',
};
