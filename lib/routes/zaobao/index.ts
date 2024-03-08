import { Route } from '@/types';
import { parseList } from './util';
const baseUrl = 'https://www.zaobao.com';

export const route: Route = {
    path: '/:type?/:section?',
    categories: ['bbs'],
    example: '/zaobao/lifestyle/health',
    parameters: { type: 'https://www.zaobao.com/**lifestyle**/health 中的 **lifestyle**', section: 'https://www.zaobao.com/lifestyle/**health** 中的 **health**' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '其他栏目',
    maintainers: ['shunf4'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'realtime';
    const section = ctx.req.param('section') ?? 'china';
    const sectionLink = `/${type}/${section}`;

    const { title, resultList } = await parseList(ctx, sectionLink);

    return {
        title: `《联合早报》${title}`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
}
