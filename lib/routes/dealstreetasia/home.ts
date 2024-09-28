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
    const items = jsonData.props.pageProps.topStories;

    const feedItems = items.map((item) => ({
        title: item.post_title,
        link: item.post_url,
        description: item.post_excerpt,
        pubDate: new Date(item.post_date).toUTCString(),
        category: item.category_link.replaceAll(/(<([^>]+)>)/gi, ''), // Clean the HTML tags
        image: item.image_url.replace(/\?.*$/, ''), // Remove query parameters using .replace
    }));

    return {
        title: 'Deal Street Asia',
        language: 'en',
        item: feedItems,
        link: 'https://dealstreetasia.com/',
    };
}
