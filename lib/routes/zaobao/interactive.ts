import { Route } from '@/types';
import { parseList } from './util';
const baseUrl = 'https://www.zaobao.com';

export const route: Route = {
    path: '/interactive-graphics',
    categories: ['traditional-media'],
    example: '/zaobao/interactive-graphics',
    name: '互动新闻',
    maintainers: ['shunf4'],
    handler,
};

async function handler(ctx) {
    const sectionLink = '/interactive-graphics';

    const { resultList } = await parseList(ctx, sectionLink);

    return {
        title: '《联合早报》互动新闻',
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
}
