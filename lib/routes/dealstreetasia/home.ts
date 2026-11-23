import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery

import type { Data, Route } from '@/types';
// import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { parseDate } from '@/utils/time';

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
    name: 'Home',
    maintainers: ['jack2game'],
    handler,
    url: 'www.dealstreetasia.com/',
};

async function handler() {
    // const section = ctx.req.param('section');
    const items = await fetchPage();

    return items;
}

async function fetchPage(): Promise<Data> {
    const baseUrl = 'https://www.dealstreetasia.com'; // Define base URL

    const response = await ofetch(`${baseUrl}/`);
    const $ = load(response);

    const jsonData = JSON.parse($('#__NEXT_DATA__').text());
    // const headingText = jsonData.props.pageProps.sectionData.name;

    const pageProps = jsonData.props.pageProps;
    const list = [
        ...pageProps.topStories,
        ...pageProps.privateEquity,
        ...pageProps.ventureCapital,
        ...pageProps.unicorns,
        ...pageProps.interviews,
        ...pageProps.deals,
        ...pageProps.analysis,
        ...pageProps.ipos,
        ...pageProps.opinion,
        ...pageProps.policyAndRegulations,
        ...pageProps.people,
        ...pageProps.earningsAndResults,
        ...pageProps.theLpView,
        ...pageProps.dvNewsletters,
        ...pageProps.reports,
    ].map((item) => ({
        title: item.post_title || item.title || 'No Title',
        link: item.post_url || item.link || '',
        description: item.post_excerpt || item.excerpt || '',
        pubDate: item.post_date ? parseDate(item.post_date) : item.date ? parseDate(item.date) : '',
        category: item.category_link ? item.category_link.replaceAll(/(<([^>]+)>)/g, '') : '', // Clean HTML if category_link exists
        image: item.image_url ? item.image_url.replace(/\?.*$/, '') : '', // Remove query parameters if image_url exists
    }));
    const seenLinks = new Set<string>();
    const items = list.filter((item) => {
        if (seenLinks.has(item.link)) {
            return false;
        }
        seenLinks.add(item.link);
        return true;
    });

    return {
        title: 'Deal Street Asia',
        language: 'en',
        item: items,
        link: 'https://dealstreetasia.com/',
    };
}
