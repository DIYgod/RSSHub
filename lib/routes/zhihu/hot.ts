import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    total: '全站',
    focus: '国际',
    science: '科学',
    car: '汽车',
    zvideo: '视频',
    fashion: '时尚',
    depth: '时事',
    digital: '数码',
    sport: '体育',
    school: '校园',
    film: '影视',
};

export const route: Route = {
    path: '/hot/:category?',
    categories: ['social-media'],
    example: '/zhihu/hot',
    parameters: { category: '分类，见下表，默认为全站' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '知乎分类热榜',
    maintainers: ['nczitzk'],
    handler,
    description: `| 全站  | 国际  | 科学    | 汽车 | 视频   | 时尚    | 时事  | 数码    | 体育  | 校园   | 影视 |
  | ----- | ----- | ------- | ---- | ------ | ------- | ----- | ------- | ----- | ------ | ---- |
  | total | focus | science | car  | zvideo | fashion | depth | digital | sport | school | film |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'total';

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v3/feed/topstory/hot-lists/${category}?limit=50`,
    });

    const items = response.data.data.map((item) => ({
        link: `https://www.zhihu.com/question/${item.target.id}`,
        title: item.target.title,
        pubDate: parseDate(item.target.created * 1000),
        description: item.target.excerpt ? `<p>${item.target.excerpt}</p>` : '',
    }));

    return {
        title: `知乎热榜 - ${titles[category]}`,
        link: `https://www.zhihu.com/hot?list=${category}`,
        item: items,
    };
}
