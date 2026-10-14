import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/chrono',
    categories: ['sport'],
    example: '/lephoceen/chrono',
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
            source: ['lephoceen.fr/chrono'],
            target: '/chrono',
        },
    ],
    name: 'Fil Info (Chrono)',
    maintainers: ['Loopy03'],
    handler: async (_) => {
        const response = await ofetch('https://www.lephoceen.fr/chrono');
        const $ = load(response);

        // Read the embedded page data.
        const jsonRaw = $('script[id="__NEXT_DATA__"]').html();
        const jsonData = JSON.parse(jsonRaw ?? '');

        // Extract the article array from the page data.
        // Structure: props -> pageProps -> data -> datas
        const articles = jsonData?.props?.pageProps?.data?.datas || [];

        const items = articles.map((item: any) => {
            // Resolve article slugs against the website.
            const baseUrl = 'https://www.lephoceen.fr';
            const link = item.slug.startsWith('http') ? item.slug : `${baseUrl}${item.slug}`;

            // The source uses Unix timestamps in seconds.
            const pubDate = parseDate(item.date.publish_at.timestamp * 1000);

            return {
                title: item.title,
                link,
                description: item.text || `[${item.category?.name}] ${item.title}`,
                pubDate, // Unix timestamps identify the publication instant.
                updated: item.date.updated_at?.timestamp ? parseDate(item.date.updated_at.timestamp * 1000) : undefined,
                category: [item.category?.name],
                image: item.images?.['16x9']?.url,
            };
        });

        return {
            title: 'Le Phocéen - Fil Info',
            link: 'https://www.lephoceen.fr/chrono',
            item: items,
        };
    },
};
