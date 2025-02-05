import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id?',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/stcn/yw',
    parameters: {
        id: {
            description: '栏目 id',
            options: [
                { value: 'kx', label: '快讯' },
                { value: 'yw', label: '要闻' },
                { value: 'gs', label: '股市' },
                { value: 'company', label: '公司' },
                { value: 'data', label: '数据' },
                { value: 'fund', label: '基金' },
                { value: 'finance', label: '金融' },
                { value: 'comment', label: '评论' },
                { value: 'cj', label: '产经' },
                { value: 'ct', label: '创投' },
                { value: 'kcb', label: '科创板' },
                { value: 'xsb', label: '新三板' },
                { value: 'tj', label: '投教' },
                { value: 'zk', label: 'ESG' },
                { value: 'gd', label: '滚动' },
                { value: 'gsyl', label: '股市一览' },
                { value: 'djjd', label: '独家解读' },
                { value: 'gsxw', label: '公司新闻' },
                { value: 'gsdt', label: '公司动态' },
                { value: 'djsj', label: '独家数据' },
                { value: 'kd', label: '看点数据' },
                { value: 'zj', label: '资金流向' },
                { value: 'sj_kcb', label: '科创板' },
                { value: 'hq', label: '行情总貌' },
                { value: 'zl', label: '专栏' },
                { value: 'author', label: '作者' },
                { value: 'cjhy', label: '行业' },
                { value: 'cjqc', label: '汽车' },
                { value: 'tjkt', label: '投教课堂' },
                { value: 'zczs', label: '政策知识' },
                { value: 'tjdt', label: '投教动态' },
                { value: 'zthd', label: '专题活动' },
            ],
            default: 'yw',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '栏目',
    maintainers: ['nczitzk'],
    handler,
    description: `| 快讯 | 要闻 | 股市 | 公司    | 数据 |
| ---- | ---- | ---- | ------- | ---- |
| kx   | yw   | gs   | company | data |

| 基金 | 金融    | 评论    | 产经 | 创投 |
| ---- | ------- | ------- | ---- | ---- |
| fund | finance | comment | cj   | ct   |

| 科创板 | 新三板 | 投教 | ESG | 滚动 |
| ------ | ------ | ---- | --- | ---- |
| kcb    | xsb    | tj   | zk  | gd   |

| 股市一览 | 独家解读 |
| -------- | -------- |
| gsyl     | djjd     |

| 公司新闻 | 公司动态 |
| -------- | -------- |
| gsxw     | gsdt     |

| 独家数据 | 看点数据 | 资金流向 | 科创板  | 行情总貌 |
| -------- | -------- | -------- | ------- | -------- |
| djsj     | kd       | zj       | sj\_kcb | hq       |

| 专栏 | 作者   |
| ---- | ------ |
| zl   | author |

| 行业 | 汽车 |
| ---- | ---- |
| cjhy | cjqc |

| 投教课堂 | 政策知识 | 投教动态 | 专题活动 |
| -------- | -------- | -------- | -------- |
| tjkt     | zczs     | tjdt     | zthd     |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'yw';

    const rootUrl = 'https://www.stcn.com';
    const currentUrl = `${rootUrl}/article/list/${id}.html`;
    const apiUrl = `${rootUrl}/article/list.html?type=${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = load(response.data);

    let items = $('.t, .tt, .title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text().replaceAll(/(^【|】$)/g, ''),
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\.html$/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('.detail-title').text();
                    item.author = content('.detail-info span').first().text().split('：').pop();
                    item.pubDate = timezone(parseDate(content('.detail-info span').last().text()), +8);
                    item.category = content('.detail-content-tags div')
                        .toArray()
                        .map((t) => content(t).text());
                    item.description = content('.detail-content').html();
                }

                return item;
            })
        )
    );

    return {
        title: `证券时报网 - ${$('.breadcrumb a').last().text()}`,
        link: currentUrl,
        item: items,
    };
}
