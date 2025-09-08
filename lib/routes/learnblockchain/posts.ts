import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/posts/:cid/:sort?',
    categories: ['programming'],
    example: '/learnblockchain/posts/DApp/newest',
    parameters: { cid: '分类id,更多分类可以论坛的URL找到', sort: '排序方式，默认精选' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['running-grass'],
    handler,
    description: `| id       | 分类         |
| -------- | ------------ |
| all      | 全部         |
| DApp     | 去中心化应用 |
| chains   | 公链         |
| 联盟链   | 联盟链       |
| scaling  | Layer2       |
| langs    | 编程语言     |
| security | 安全         |
| dst      | 存储         |
| basic    | 理论研究     |
| other    | 其他         |

| id       | 排序方式    |
| -------- | ----------- |
| newest   | 最新        |
| featured | 精选 (默认) |
| featured | 最赞        |
| hottest  | 最热        |`,
};

async function handler(ctx) {
    const cid = ctx.req.param('cid') || 'all';
    const sort = ctx.req.param('sort');

    let url = 'https://learnblockchain.cn/categories/';
    url += cid + '/';

    if (sort) {
        url += sort + '/';
    }

    const response = await got(url);

    const data = response.data;
    const $ = load(data);
    const list = $('div.stream-list section.stream-list-item');

    return {
        title: `登链社区--${cid}`,
        link: url,
        description: `登链社区`,
        item: list.toArray().map((ite) => {
            const item = $(ite);
            const json = {
                title: item.find('h2.title').text().trim(),
                description: item.find('div.excerpt').text().trim(),
                pubDate: parseRelativeDate(item.find('.author li:nth-child(2)').text().replace('发布于', '').trim()),
                link: item.find('h2.title a').attr('href').trim(),
                author: item.find('.author li:nth-child(1)').text().trim(),
            };

            return json;
        }),
    };
}
