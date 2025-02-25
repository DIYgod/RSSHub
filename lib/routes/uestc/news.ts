import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const dateRegex = /(20\d{2}).(\d{2})-(\d{2})/;

const baseUrl = 'https://news.uestc.edu.cn';

const map = {
    academy: '/?n=UestcNews.Front.CategoryV2.Page&CatId=66',
    culture: '/?n=UestcNews.Front.CategoryV2.Page&CatId=67',
    announcement: '/?n=UestcNews.Front.CategoryV2.Page&CatId=68',
};

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/uestc/news/culture',
    parameters: { type: '默认为 `announcement`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['news.uestc.edu.cn/'],
            target: '/news',
        },
    ],
    name: '新闻中心',
    maintainers: ['achjqz', 'mobyw'],
    handler,
    url: 'news.uestc.edu.cn/',
    description: `| 学术    | 文化    | 公告         | 校内通知     |
| ------- | ------- | ------------ | ------------ |
| academy | culture | announcement | notification |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'announcement';
    const pageUrl = map[type];
    if (!pageUrl) {
        throw new InvalidParameterError('type not supported');
    }

    const response = await got.get(baseUrl + pageUrl);

    const $ = load(response.data);

    const items = $('div.notice-item.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').text().trim();
            const newsLink = baseUrl + item.find('a').attr('href');
            const newsDate = parseDate(item.find('div.date-box-sm').text().replace(dateRegex, '$1-$2-$3'));
            const newsDescription = item.find('div.content').text().trim().replace('&nbsp;', '');

            return {
                title: newsTitle,
                link: newsLink,
                description: newsDescription,
                pubDate: newsDate,
            };
        })
        .get();

    return {
        title: '新闻网通知',
        link: baseUrl,
        description: '电子科技大学新闻网信息公告',
        item: out,
    };
}
