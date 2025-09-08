import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/papers/:category?/:time?/:cited?',
    categories: ['journal'],
    example: '/trendingpapers/papers',
    parameters: {
        category: 'Category of papers, can be found in URL. `All categories` by default.',
        time: 'Time like `24 hours` to specify the duration of ranking, can be found in URL. `Since beginning` by default.',
        cited: 'Cited or uncited papers, can be found in URL. `Cited and uncited papers` by default.',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Trending Papers on arXiv',
    maintainers: ['CookiePieWw'],
    handler,
};

async function handler(ctx) {
    const { time = 'Since beginning', cited = 'Cited and uncited papers', category = 'All categories' } = ctx.req.param();

    const rootUrl = 'https://trendingpapers.com';
    const currentUrl = `${rootUrl}/api/papers?p=1&o=pagerank_growth&pd=${time}&cc=${cited}&c=${category}`;

    const response = await ofetch(currentUrl);

    const papers = response.data.map((_) => {
        const title = _.title;
        const abstract = _.abstract;
        const url = _.url;
        const arxivId = _.arxiv_id;

        const pubDate = parseDate(_.pub_date);
        const summaryCategories = _.summary_categories;

        return {
            title,
            description: abstract,
            link: url,
            guid: arxivId,
            pubDate,
            category: summaryCategories,
        };
    });

    return {
        title: `Trending Papers on arXiv.org | ${category} | ${time} | ${cited} | `,
        link: currentUrl,
        item: papers,
    };
}
