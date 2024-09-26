import { Route } from '@/types';
import cache from '@/utils/cache';
// import ofetch from '@/utils/ofetch'; // Unified request library used
import { load } from 'cheerio'; // An HTML parser with an API similar to jQuery
import puppeteer from '@/utils/puppeteer';
// import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/home',
    categories: ['traditional-media'],
    example: '/dealstreetasia/home',
    // parameters: { section: 'target section' },
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
    name: 'Deal Street Asia - Home',
    maintainers: ['jack2game'],
    handler,
    url: 'dealstreetasia.com/',
};

async function handler() {
    // const section = ctx.req.param('section');
    // const items = await fetchPage(section);
    const items = await fetchPage();

    return items;
}

async function fetchPage() {
    const baseUrl = 'https://dealstreetasia.com'; // Define base URL

    // require puppeteer utility class and initialise a browser instance
    const browser = await puppeteer();
    // open a new tab
    const page = await browser.newPage();
    // intercept all requests
    await page.setRequestInterception(true);
    // only allow certain types of requests to proceed
    page.on('request', (request) => {
        const allowedResourceTypes = ['document', 'script', 'xhr'];
        allowedResourceTypes.includes(request.resourceType()) ? request.continue() : request.abort();
    });
    // visit the target link
    const link = `${baseUrl}/`;
    // ofetch requests will be logged automatically
    // but puppeteer requests are not
    // so we need to log them manually

    await page.goto(link, {
        // specify how long to wait for the page to load
        waitUntil: 'networkidle2',
    });
    // retrieve the HTML content of the page
    const response = await page.content();
    // close the tab
    page.close();

    const $ = load(response);

    // don't forget to close the browser instance at the end of the function

    const origin1 = $('.card-lead-story .card-body-inner');
    // console.log('Number of items found:', origin1.length);
    const list1 = origin1.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h2.card-title'); // Get the title element
        const title = titleElement.text(); // Extract the title text
        const storyLink = titleElement.closest('a').attr('href'); // Find the link to the story
        const link = `${baseUrl}${storyLink}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

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

    const origin2 = $('.card-side-lead-story');
    // console.log('Number of items found:', origin2.length);
    const list2 = origin2.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h3.card-title'); // Get the title element
        const title = titleElement.text(); // Extract the title text
        const storyLink = titleElement.closest('a').attr('href'); // Find the link to the story
        const link = `${baseUrl}${storyLink}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

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

    const origin3 = $('.divide-section-equally .story-with-image');
    // console.log('Number of items found:', origin3.length);
    const list3 = origin3.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('h3'); // Updated to target the correct title element
        const title = titleElement.text(); // Extract the title text
        const storyLink = titleElement.closest('a').attr('href'); // Find the link to the story
        const link = `${baseUrl}${storyLink}`; // Create absolute link
        const category = item.find('.category-link a').text(); // Get category link text

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

    const list = [...list3, ...list2, ...list1];
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // highlight-start
                // reuse the browser instance and open a new tab
                const page = await browser.newPage();
                // set up request interception to only allow document requests
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    const allowedResourceTypes = ['document', 'script', 'xhr'];
                    allowedResourceTypes.includes(request.resourceType()) ? request.continue() : request.abort();
                });

                await page.goto(item.link, {
                    waitUntil: 'networkidle2',
                });
                const response = await page.content();
                // close the tab after retrieving the HTML content
                page.close();

                const $ = load(response);
                // highlight-end
                // Capture the content of any div with a class that includes "Story_wrapper"
                const storyWrapper = $('div[class*="Story_wrapper"]');

                // Remove <h1> from the Story_wrapper
                storyWrapper.find('h1').remove();
                storyWrapper.find('div[class*="Tags_wrapper"]').remove();
                storyWrapper.find('div[class*="Story_side_bar_content"]').remove();
                storyWrapper.find('div[class*="print_watermark_overlay"]').remove();
                storyWrapper.find('div[class*="overlay"]').remove();
                storyWrapper.find('div[class*="subscribe-now"]').remove();
                storyWrapper.find('img').each((i, img) => {
                    const src = $(img).attr('src'); // Extract the src attribute
                    $(img).attr('src', src); // Keep only the src attribute
                    $(img).removeAttr('alt'); // Remove alt
                    $(img).removeAttr('class'); // Remove class
                    $(img).removeAttr('style'); // Remove style
                    $(img).removeAttr('width'); // Remove width or any other attributes
                    $(img).removeAttr('decoding');
                    $(img).removeAttr('sizes');
                    $(img).removeAttr('srcset');
                    $(img).removeAttr('data-nimg');
                    $(img).removeAttr('referrerpolicy');
                });

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

    // close the browser instance after all requests are done
    browser.close();

    return {
        title: 'Deal Street Asia',
        language: 'en',
        item: items,
        link: 'https://dealstreetasia.com/',
    };
}
