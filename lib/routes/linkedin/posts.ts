import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { BASE_URL } from './utils';

export const route: Route = {
    path: '/company/:company_id/posts',
    categories: ['social-media'],
    example: '/linkedin/company/google/posts',
    parameters: { company_id: "Company's LinkedIn profile ID " },
    description: "Get company's LinkedIn posts by company ID",
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Company Posts',
    maintainers: ['saifazmi'],
    handler,
};

function handler(ctx) {
    const { company_id } = ctx.req.param('company_id');

    const url = new URL(`${BASE_URL}/company/${company_id}`);

    const posts = [];

    // dummy data
    posts.push({
        title: 'This is my website',
        link: 'https://saifazmi.com',
        date: '1w',
    });

    return {
        title: `LinkedIn - ${company_id} Posts`,
        link: url.href,
        item: posts.map((post) => ({
            title: post.title,
            link: post.link,
            pubDate: parseDate(post.date),
        })),
    };
}
