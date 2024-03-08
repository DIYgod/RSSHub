import { Route } from '@/types';
import { parseSearchHit, parseJobPosting } from './utils';

const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';

export const route: Route = {
    path: '/cn/jobs/:keywords?',
    categories: ['other'],
    example: '/linkedin/cn/jobs/Software',
    parameters: { keywords: '搜索关键字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Jobs',
    maintainers: ['bigfei'],
    handler,
};

async function handler(ctx) {
    const { title, jobs } = await parseSearchHit(ctx);
    const items = await Promise.all(jobs.map((job) => parseJobPosting(ctx, job)));
    return {
        title: `领英 - ${title}`,
        link: siteUrl,
        item: items,
    };
}
