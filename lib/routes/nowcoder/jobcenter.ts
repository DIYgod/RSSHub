import { Route } from '@/types';
import cache from '@/utils/cache';
import * as url from 'node:url';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?',
    categories: ['bbs'],
    example: '/nowcoder/jobcenter/1/北京/1/1/true',
    parameters: {
        recruitType: '招聘分类，`1` 指 实习广场，`2` 指 社招广场，默认为 `1`',
        city: '所在城市，可选城市见下表，若空则为 `全国`',
        type: '职位类型，可选职位代码见下表，若空则为 `全部`',
        order: '排序参数，可选排序参数代码见下表，若空则为 `默认`',
        latest: '是否仅查看最近一周，可选 `true` 和 `false`，默认为 `false`',
    },
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
            source: ['nowcoder.com/'],
            target: '/jobcenter',
        },
    ],
    name: '实习广场 & 社招广场',
    maintainers: ['nczitzk'],
    handler,
    url: 'nowcoder.com/',
    description: `可选城市有：北京、上海、广州、深圳、杭州、南京、成都、厦门、武汉、西安、长沙、哈尔滨、合肥、其他

  职位类型代码见下表：

| 研发 | 测试 | 数据 | 算法 | 前端 | 产品 | 运营 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 5    | 6    | 7    | 0    |

  排序参数见下表：

| 最新发布 | 最快处理 | 处理率最高 |
| -------- | -------- | ---------- |
| 1        | 2        | 3          |`,
};

async function handler(ctx) {
    const rootUrl = `https://www.nowcoder.com/job/center/`;
    const currentUrl = `${rootUrl}?${ctx.req.param('type') ? 'type=' + ctx.req.param('type') : ''}${ctx.req.param('city') ? '&city=' + ctx.req.param('city') : ''}${ctx.req.param('order') ? '&order=' + ctx.req.param('order') : ''}${
        ctx.req.param('recruitType') ? '&recruitType=' + ctx.req.param('recruitType') : ''
    }${ctx.req.param('latest') ? '&latest=' + ctx.req.param('latest') : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const list = $('ul.reco-job-list li')
        .slice(0, 30)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a.reco-job-title');
            const company = item.find('div.reco-job-com a');
            const time = item.find('div.reco-job-detail span').eq(1).text();
            const date = new Date();
            if (time.includes('天')) {
                const day = time.split('天')[0];
                date.setDate(date.getDate() - day);
            } else if (time.includes('小时')) {
                const hour = time.split('小时')[0];
                date.setHours(date.getHours() - hour);
            }
            return {
                title: `${company.text()} | ${title.text()}`,
                link: url.resolve(rootUrl, title.attr('href')),
                pubDate: date.toUTCString(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.description = content('div.rec-job').html();
                return item;
            })
        )
    );

    return {
        title: `${ctx.req.param('recruitType') ? (ctx.req.param('recruitType') === '2' ? '社招广场' : '实习广场') : '实习广场'} - 牛客网`,
        link: rootUrl,
        item: items,
    };
}
