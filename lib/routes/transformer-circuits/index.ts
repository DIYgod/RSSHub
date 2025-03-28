import { Route, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

// Define the main route path
export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/transformer-circuits',
    parameters: {},
    radar: [
        {
            source: ['transformer-circuits.pub/'],
            target: '/',
        },
    ],
    name: 'Articles',
    maintainers: ['shinmohuang'],
    handler,
};

async function handler() {
    const rootUrl = 'https://transformer-circuits.pub';

    // Fetch the main page
    const response = await ofetch(rootUrl);
    const $ = load(response);

    // Get all the articles using .map() instead of .push()
    const articles: DataItem[] = $('.toc a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const currentElement = $item;
            const dateElement = $item.prevAll('.date').first();
            const currentDate = dateElement.text().trim();

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
                return {
                    title,
                    link: articleUrl,
                    pubDate: parseDate(currentDate, 'MMMM YYYY'),
                    author,
                    description: `${articleType}: ${description}`,
                    category: ['AI', 'Machine Learning', 'Anthropic', 'Transformer Circuits'],
                };
            }
            return null;
        })
        .filter(Boolean) as DataItem[];

    return {
        title: 'Transformer Circuits Thread',
        link: rootUrl,
        item: articles,
        description: 'Research on reverse engineering transformer language models into human-understandable programs',
    };
}
