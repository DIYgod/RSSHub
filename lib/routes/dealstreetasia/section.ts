import { Route } from '@/types';
// import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
// import puppeteer from '@/utils/puppeteer';
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/section/:section',
    categories: ['traditional-media'],
    example: '/dealstreetasia/section/private-equity',
    parameters: { section: 'target section' },
    radar: [
        {
            source: ['dealstreetasia.com/'],
        },
    ],
    name: 'Section',
    maintainers: ['jack2game'],
    handler,
    url: 'dealstreetasia.com/',
};

async function handler(ctx) {
    const section = ctx.req.param('section');
    const items = await fetchPage(section);

    return items;
}

async function fetchPage(section: string) {
    const baseUrl = 'https://dealstreetasia.com'; // Define base URL

    const response = await ofetch(`${baseUrl}/section/${section}/`);
    const $ = load(response);

    const jsonData = JSON.parse($('#__NEXT_DATA__').text());
    const headingText = jsonData.props.pageProps.sectionData.name;

    const items = jsonData.props.pageProps.sectionData.stories.nodes;

    const feedItems = items.map((item) => ({
        title: item.title || 'No Title',
        link: item.uri ? `https://www.dealstreetasia.com${item.uri}` : '',
        description: item.excerpt || '', // Default to empty string if undefined
        pubDate: item.post_date ? new Date(item.post_date).toUTCString() : '',
        category: item.sections.nodes.map((section) => section.name),
        image: item.featuredImage?.node?.mediaItemUrl.replace(/\?.*$/, ''), // Use .replace to sanitize the image URL
    }));

    return {
        title: 'Deal Street Asia - ' + headingText,
        language: 'en',
        item: feedItems,
        link: 'https://dealstreetasia.com/section/' + section + '/',
    };
}
