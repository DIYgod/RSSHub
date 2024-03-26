import { Route } from '@/types';
import { rootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/95mm/tag/黑丝',
    parameters: { tag: '标签，可在对应标签页中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['95mm.org/'],
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    handler,
    url: '95mm.org/',
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');

    const currentUrl = `${rootUrl}/tag-${tag}/page-1/index.html`;

    return await ProcessItems(ctx, tag, currentUrl);
}
