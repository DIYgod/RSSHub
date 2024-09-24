import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/section/:section',
    categories: ['traditional-media'],
    example: '/dealstreetasia/section/private-equity',
    parameters: { section: 'target section' },
    // features: {
    // requireConfig: false,
    // requirePuppeteer: false,
    // antiCrawler: false,
    // supportBT: false,
    // supportPodcast: false,
    // supportScihub: false,
    // },
    radar: [
        {
            source: ['dealstreetasia.com/'],
        },
    ],
    name: 'Deal Street Asia - Section',
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
    const response = await ofetch(`${baseUrl}/section/${section}`);
    const $ = load(response);

    const headingText = $('h1.main-list-heading').text();

    const rows = $('.main-list-row');
    // console.log('Number of items found:', rows.length); // Log the number of rows found
    const list1 = rows.toArray().map((item) => {
        item = $(item);
        const a = item.find('a').first();
        const title = item.find('h3').text(); // Get the title from h3
        const link = `${baseUrl}${a.attr('href')}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

        // console.log('Item:', { title, link, pubDate, category }); // Log each item to check values
        // console.log('Item:', { title, link, category }); // Log each item to check values

        return {
            title: title || 'No title', // Default title in case it's empty
            link,
            // description: title, // Adding description for each item (can improve if needed)
            // pubDate: pubDate || '', // Uncomment and add date parsing if needed
            // author: author || 'Unknown',
            category: category ? [category] : [],
        };
    });

    const cards = $('.card-deck .card-body');
    // console.log('Number of items found:', cards.length);
    const list2 = cards.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h3.card-title'); // Get the title element
        const title = titleElement.text(); // Extract the title text
        const storyLink = titleElement.closest('a').attr('href'); // Find the link to the story
        const link = `${baseUrl}${storyLink}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

        // console.log('Item:', { title, link, pubDate, category }); // Log each item to check values
        // console.log('Item:', { title, link, category }); // Log each item to check values

        return {
            title: title || 'No title', // Default title in case it's empty
            link,
            // description: title, // Adding description for each item (can improve if needed)
            // pubDate: pubDate || '', // Uncomment and add date parsing if needed
            // author: author || 'Unknown',
            category: category ? [category] : [],
        };
    });

    const focuses = $('.section-hero.card .card-body'); // Target card-body within the specific section-hero card context
    // console.log('Number of items found:', focuses.length);
    const list3 = focuses.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h2.card-title'); // Updated to target the correct title element
        const title = titleElement.text(); // Extract the title text
        const storyLink = titleElement.closest('a').attr('href'); // Find the link to the story
        const link = `${baseUrl}${storyLink}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

        // console.log('Item:', { title, link, pubDate, category }); // Log each item to check values
        // console.log('Item:', { title, link, category }); // Log each item to check values

        return {
            title: title || 'No title', // Default title in case it's empty
            link,
            // description: title, // Adding description for each item (can improve if needed)
            // pubDate: pubDate || '', // Uncomment and add date parsing if needed
            // author: author || 'Unknown',
            category: category ? [category] : [],
        };
    });

    const list = list3.concat(list2.concat(list1));
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // Capture the content of any div with a class that includes "Story_wrapper"
                const storyWrapper = $('div[class*="Story_wrapper"]');

                // Remove <h1> from the Story_wrapper
                storyWrapper.find('h1').remove();
                storyWrapper.find('div[class*="Tags_wrapper"]').remove();

                // Assign the remaining HTML to item.description
                item.description = storyWrapper.html();
                // item.description = paragraphs;

                const authorLink = $('a[class*="Story_author"]');
                const authorName = authorLink.text(); // Get the text content
                // const authorUrl = authorLink.attr('href'); // Get the href attribute
                item.author = authorName;

                item.pubDate = $('a[class*="Story_date"]').text();

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );

    return {
        title: 'Deal Street Asia - ' + headingText,
        language: 'en',
        item: items,
        link: 'https://dealstreetasia.com/section/' + section + '/',
    };
}
