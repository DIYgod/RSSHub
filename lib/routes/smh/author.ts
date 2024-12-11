import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/by/:authorSlug',
    categories: ['programming'],
    example: '/smh/by/natassia-chrysanthos-h17jwj',
    parameters: { authorSlug: 'Slug of the author profile URL' },
    name: 'Articles by an author',
    maintainers: ['yue-dongchen'],
    handler: async (ctx) => {
        const baseUrl = 'https://smh.com.au';
        const { authorSlug = 'natassia-chrysanthos-h17jwj' } = ctx.req.param();
        const link = `https://smh.com.au/by/${authorSlug}`;

        const response = await ofetch(link);
        const $ = load(response);
        const items = $('div.X3yYQ')
            .toArray()
            .map((item) => {
                const summaryBlock = $(item).find('div._2g9tm');
                const image = $(item).find('img._1MQMh');

                // Content extraction not possible due to paywall.
                return {
                    title: summaryBlock.find('[data-testid=article-link]').text(),
                    description: summaryBlock.find('p._3b7W-').text(),
                    pubDate: summaryBlock.find('time').attr('datetime'),
                    image: image.attr('src'),
                    link: baseUrl + summaryBlock.find('[data-testid=article-link]').attr('href'),
                };
            });

        // Extract the headline, which is not within the scope of above selections.
        const headline = $('div._15r1L');
        const headlineSummaryBlock = headline.find('div._1YzQk');
        const headlineTitle = headlineSummaryBlock.find('[data-testid=article-link]').text();
        const headlineDescription = headlineSummaryBlock.find('p._3XEsE').text();
        const headlineDate = (() => {
            const value = headlineSummaryBlock.find('time').attr('datetime');
            if (value === undefined) {
                return;
            }
            return new Date(value);
        })();
        const headlineImage = headline.find('img._1MQMh').attr('src');

        // Prepend the headline item to the array of items.
        items.unshift({
            title: headlineTitle,
            description: headlineDescription,
            pubDate: headlineDate,
            image: headlineImage,
            link: baseUrl + headlineSummaryBlock.find('[data-testid=article-link]').attr('href'),
        });

        const authorName = $('h2.s9igt').text();

        return {
            title: `Articles by ${authorName} (SMH)`,
            link,
            item: items,
        };
    },
};
