import { Route } from '@/types';
// import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
// import puppeteer from '@/utils/puppeteer';
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/home',
    categories: ['traditional-media'],
    example: '/dealstreetasia/home',
    // parameters: { section: 'target section' },
    radar: [
        {
            source: ['dealstreetasia.com/'],
        },
    ],
    name: 'Deal Street Asia - Home',
    maintainers: ['jack2game'],
    handler,
    url: 'dealstreetasia.com/',
};

async function handler() {
    // const section = ctx.req.param('section');
    const items = await fetchPage();

    return items;
}

async function fetchPage() {
    const baseUrl = 'https://dealstreetasia.com'; // Define base URL

    const response = await ofetch(`${baseUrl}/`);
    const $ = load(response);

    const jsonData = JSON.parse($('#__NEXT_DATA__').html());
    // const headingText = jsonData.props.pageProps.sectionData.name;

    const categoryKeys = ['topStories', 'privateEquity', 'ventureCapital', 'unicorns', 'interviews', 'deals', 'analysis', 'ipos', 'opinion', 'policyAndRegulations', 'people', 'earningsAndResults', 'theLpView', 'dvNewsletters'];

    // Create a single combined list for all items using `for...of` instead of `reduce()`
    const combinedList = [];

    for (const key of categoryKeys) {
        const items = jsonData.props.pageProps[key];
        if (Array.isArray(items)) {
            const list = items.map((item) => ({
                title: item.post_title || 'No Title',
                link: item.post_url || '',
                description: item.post_excerpt || '',
                pubDate: item.post_date ? new Date(item.post_date).toUTCString() : '',
                category: item.category_link ? item.category_link.replaceAll(/(<([^>]+)>)/gi, '') : '', // Clean HTML if category_link exists
                image: item.image_url ? item.image_url.replace(/\?.*$/, '') : '', // Remove query parameters if image_url exists
            }));
            combinedList.push(...list); // Use the spread operator instead of `concat`
        }
    }

    const items1 = jsonData.props.pageProps.reports;
    const list1 = items1.map((item) => ({
        title: item.title || 'No Title',
        link: item.link || '',
        description: item.excerpt || '',
        pubDate: item.date ? new Date(item.date).toUTCString() : '',
        category: item.category_link ? item.category_link.replaceAll(/(<([^>]+)>)/gi, '') : '', // Clean HTML if category_link exists
        image: item.image_url ? item.image_url.replace(/\?.*$/, '') : '', // Remove query parameters if image_url exists
    }));

    const list = [...combinedList, ...list1];

    return {
        title: 'Deal Street Asia',
        language: 'en',
        item: list,
        link: 'https://dealstreetasia.com/',
    };
}
