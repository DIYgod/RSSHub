import { Route } from '@/types';
import { parseList } from './util';
const baseUrl = 'https://www.zaobao.com';

export const route: Route = {
    path: '/znews/:section?',
    categories: ['traditional-media'],
    example: '/zaobao/znews/china',
    parameters: { section: '分类，缺省为 china' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['shunf4'],
    handler,
    description: `| 中国  | 新加坡    | 东南亚 | 国际  | 体育   |
  | ----- | --------- | ------ | ----- | ------ |
  | china | singapore | sea    | world | sports |`,
};

async function handler(ctx) {
    const section = ctx.req.param('section');

    let info;
    let sectionLink;

    switch (section) {
        case 'singapore':
            info = '新加坡';
            sectionLink = '/news/singapore';

            break;

        case 'world':
            info = '国际';
            sectionLink = '/news/world';

            break;

        case 'sea':
            info = '东南亚';
            sectionLink = '/news/sea';

            break;

        case 'sports':
            info = '体育';
            sectionLink = '/news/sports';

            break;

        case 'china':
        default:
            info = '中国';
            sectionLink = '/news/china';
    }

    const { resultList } = await parseList(ctx, sectionLink);

    return {
        title: `《联合早报》-${info}-新闻`,
        link: baseUrl + sectionLink,
        description: '新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。',
        item: resultList,
    };
}
