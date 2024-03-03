// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { time = 'Since beginning', cited = 'Cited and uncited papers', category = 'All categories' } = ctx.req.param();

    const rootUrl = 'https://trendingpapers.com';
    const currentUrl = `${rootUrl}/api/papers?p=1&o=pagerank_growth&pd=${time}&cc=${cited}&c=${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = response.data;

    const papers = $.data.map((_) => {
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

    ctx.set('data', {
        title: `Trending Papers on arXiv.org | ${category} | ${time} | ${cited} | `,
        link: currentUrl,
        item: papers,
    });
};
