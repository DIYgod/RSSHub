import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery

import type { Data, Route } from '@/types';
// import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/section/:section',
    categories: ['traditional-media'],
    example: '/dealstreetasia/section/private-equity',
    parameters: { section: 'target section' },
    radar: [
        {
            source: ['dealstreetasia.com/section/:section/'],
            target: '/section/:section',
        },
    ],
    name: 'Section',
    maintainers: ['jack2game'],
    handler,
    url: 'www.dealstreetasia.com/',
};

async function handler(ctx) {
    const section = ctx.req.param('section');
    const items = await fetchPage(section);

    return items;
}

async function fetchPage(section: string): Promise<Data> {
    const baseUrl = 'https://www.dealstreetasia.com'; // Define base URL

    const response = await ofetch(`${baseUrl}/section/${section}/`);
    const $ = load(response);

    const jsonData = JSON.parse($('#__NEXT_DATA__').text());
    const headingText = jsonData.props.pageProps.sectionData.name;

    const items = jsonData.props.pageProps.sectionData.stories.nodes;

    const feedItems = items.map((item) => ({
        title: item.title || 'No Title',
        link: item.uri ? `https://www.dealstreetasia.com${item.uri}` : '',
        description: item.excerpt || '', // Default to empty string if undefined
        pubDate: item.post_date ? parseDate(item.post_date) : '',
        category: item.sections.nodes.map((section) => section.name),
        image: item.featuredImage?.node?.mediaItemUrl.replace(/\?.*$/, ''), // Use .replace to sanitize the image URL
    }));

    return {
        title: 'Deal Street Asia - ' + headingText,
        language: 'en',
        item: feedItems,
        link: 'https://www.dealstreetasia.com/section/' + section + '/',
    };
}
