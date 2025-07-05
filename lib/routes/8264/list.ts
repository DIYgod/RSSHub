import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/list/:id?',
    categories: ['bbs'],
    example: '/8264/list/751',
    parameters: { id: '列表 id，见下表，默认为 751，即热门推荐' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '列表',
    maintainers: ['nczitzk'],
    handler,
    description: `| 热门推荐 | 户外知识 | 户外装备 |
| -------- | -------- | -------- |
| 751      | 238      | 204      |

<details>
<summary>更多列表</summary>

#### 热门推荐

| 业界 | 国际 | 专访 | 图说 | 户外 | 登山 | 攀岩 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 489  | 733  | 746  | 902  | 914  | 934  | 935  |

#### 户外知识

| 徒步 | 露营 | 安全急救 | 领队 | 登雪山 |
| ---- | ---- | -------- | ---- | ------ |
| 242  | 950  | 931    | 920  | 915  |

| 攀岩 | 骑行 | 跑步 | 滑雪 | 水上运动 |
| ---- | ---- | ---- | ---- | -------- |
| 916  | 917  | 918  | 919  | 921    |

| 钓鱼 | 潜水 | 攀冰 | 冲浪 | 网球 |
| ---- | ---- | ---- | ---- | ---- |
| 951  | 952  | 953  | 966  | 967  |

| 绳索知识 | 高尔夫 | 马术 | 户外摄影 | 羽毛球 |
| -------- | ------ | ---- | -------- | ------ |
| 968    | 969  | 970  | 973    | 971  |

| 游泳 | 溯溪 | 健身 | 瑜伽 |
| ---- | ---- | ---- | ---- |
| 974  | 975  | 976  | 977  |

#### 户外装备

| 服装 | 冲锋衣 | 抓绒衣 | 皮肤衣 | 速干衣 |
| ---- | ------ | ------ | ------ | ------ |
| 209  | 923  | 924  | 925  | 926  |

| 羽绒服 | 软壳 | 户外鞋 | 登山鞋 | 徒步鞋 |
| ------ | ---- | ------ | ------ | ------ |
| 927  | 929  | 211  | 928  | 930  |

| 越野跑鞋 | 溯溪鞋 | 登山杖 | 帐篷 | 睡袋 |
| -------- | ------ | ------ | ---- | ---- |
| 933    | 932  | 220  | 208  | 212  |

| 炉具 | 灯具 | 水具 | 面料 | 背包 |
| ---- | ---- | ---- | ---- | ---- |
| 792  | 218  | 219  | 222  | 207  |

| 防潮垫 | 电子导航 | 冰岩绳索 | 综合装备 |
| ------ | -------- | -------- | -------- |
| 214  | 216    | 215    | 223    |
</details>`,
};

async function handler(ctx) {
    const { id = '751' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.8264.com';
    const currentUrl = new URL(`list/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    $('div.newslist_info').remove();

    let items = $('div.newlist_r, div.newslist_r, div.bbslistone_name, dt')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse, 'gbk'));

                content('a.syq, a.xlsj, a.titleoverflow200, #fjump').remove();
                content('i.pstatus').remove();
                content('div.crly').remove();

                const pubDate = content('span.pub-time').text() || content('span.fby span').first().prop('title') || content('span.fby').first().text().split('发表于').pop().trim();

                content('img').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(this).prop('file'),
                                alt: content(this).prop('alt'),
                            },
                        })
                    );
                });

                item.title = content('h1').first().text();
                item.description = content('div.art-content, td.t_f').first().html();
                item.author = content('a.user-name, #author').first().text();
                item.category = content('div.fl_dh a, div.site a')
                    .toArray()
                    .map((c) => content(c).text().trim());
                item.pubDate = timezone(parseDate(pubDate, ['YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm']), +8);

                return item;
            })
        )
    );

    const description = $('meta[name="description"]').prop('content').trim();
    const icon = new URL('favicon', rootUrl).href;

    return {
        item: items,
        title: `${$('span.country, h2').text()} - ${description.split(',').pop()}`,
        link: currentUrl,
        description,
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content').trim(),
        author: $('meta[name="author"]').prop('content'),
    };
}
