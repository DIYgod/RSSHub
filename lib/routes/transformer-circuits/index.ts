import { Route, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

// Define the main route path
export const route: Route = {
    path: ['/', '/index'],
    categories: ['programming'],
    example: '/transformer-circuits',
    parameters: {},
    radar: [
        {
            source: ['transformer-circuits.pub/'],
            target: '/transformer-circuits',
        },
    ],
    name: 'Transformer Circuits Thread Articles',
    maintainers: ['shinmohuang'],
    handler,
};

async function handler() {
    const rootUrl = 'https://transformer-circuits.pub';

    // Fetch the main page
    const response = await ofetch(rootUrl);
    const $ = load(response);

    // Get all the articles
    const articles: DataItem[] = [];

    // Find articles based on the actual HTML structure
    let currentDate = '';

    // The website structure has date headers followed by article links
    $('.date').each((_, dateElem) => {
        // Extract the date text (e.g., "March 2025")
        currentDate = $(dateElem).text().trim();

        // Process all articles that follow this date until the next date header
        let currentElement = $(dateElem).next();

        while (currentElement.length && !currentElement.hasClass('date')) {
            // Check if this is an article (either paper or note)
            if (currentElement.hasClass('paper') || currentElement.hasClass('note')) {
                const articleType = currentElement.hasClass('paper') ? 'Paper' : 'Note';

                // Extract title
                const title = currentElement.find('h3').text().trim();

                // Extract author if available (papers have bylines, notes don't always have them)
                let author = '';
                const byline = currentElement.find('.byline');
                if (byline.length) {
                    author = byline.text().trim();
                }
                // Extract description
                const description = currentElement.find('.description').text().trim();

                // Get the article URL
                const href = currentElement.attr('href');
                const articleUrl = href ? (href.startsWith('http') ? href : `${rootUrl}/${href}`) : rootUrl;

                // Create article object
                articles.push({
                    title,
                    link: articleUrl,
                    pubDate: parseDate(currentDate, 'MMMM YYYY'),
                    author,
                    description: `${articleType}: ${description}`,
                    category: ['AI', 'Machine Learning', 'Transformer Circuits'],
                });
            }

            // Move to the next element
            currentElement = currentElement.next();
        }
    });

    return {
        title: 'Transformer Circuits Thread',
        link: rootUrl,
        item: articles,
        description: 'Research on reverse engineering transformer language models into human-understandable programs',
    };
}
