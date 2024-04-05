import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.slowmist.com';
import { finishArticleItem } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/:type?',
    categories: ['new-media'],
    example: '/slowmist/research',
    parameters: { type: '分类，见下表，默认为公司新闻' },
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
            source: ['slowmist.com/zh/news.html'],
        },
    ],
    name: '动态',
    maintainers: ['AtlasQuan'],
    handler,
    url: 'slowmist.com/zh/news.html',
    description: `| 公司新闻 | 漏洞披露 | 技术研究 |
  | -------- | -------- | -------- |
  | news     | vul      | research |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type');

    let title = '慢雾科技 - ';
    switch (type) {
        case 'news':
            title += '公司新闻';

            break;

        case 'vul':
            title += '漏洞披露';

            break;

        case 'research':
            title += '技术研究';

            break;

        default:
            type = 'news';
            title += '公司新闻';
    }

    const url = `${baseUrl}/api/get_list?type=${type}`;

    const response = await got(url);

    let items = (response.data.data || []).map((item) => ({
        title: item.title,
        link: item.url,
        description: item.desc,
        pubDate: parseDate(item.date),
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(item)));

    return {
        title,
        link: url,
        item: items,
    };
}
