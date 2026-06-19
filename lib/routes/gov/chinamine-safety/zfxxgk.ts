import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { fetchData, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/zfxxgk/:category{.+}?',
    name: '政府信息公开',
    example: '/gov/chinamine-safety/zfxxgk',
    parameters: { category: '分类，见下表，默认为法定主动公开内容 > 通知公告' },
    radar: [
        {
            title: '政府信息公开指南',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/zfxxgkzn'],
            target: '/zfxxgk/zfxxgkzn',
        },
        {
            title: '政府信息公开制度',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/zfxxgkzd'],
            target: '/zfxxgk/zfxxgkzd',
        },
        {
            title: '通知公告',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/tzgg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/tzgg',
        },
        {
            title: '征求意见',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zqyj_01', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zqyj_01',
        },
        {
            title: '政策法规',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcfg',
        },
        {
            title: '规划计划',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/ghjh', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/ghjh',
        },
        {
            title: '政策解读',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcjd', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcjd',
        },
        {
            title: '安全许可',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/anqxk', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/anqxk',
        },
        {
            title: '事故查处',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc',
        },
        {
            title: '人事信息',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/rsxx', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/rsxx',
        },
        {
            title: '财务信息',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/cwxx', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/cwxx',
        },
        {
            title: '建议提案办理',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/jytabl_4823', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/jytabl_4823',
        },
        {
            title: '政策法规 - 法律',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/fl_01', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcfg/fl_01',
        },
        {
            title: '政策法规 - 行政法规',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/xzfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcfg/xzfg',
        },
        {
            title: '政策法规 - 部门规章',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/bmgz_01', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcfg/bmgz_01',
        },
        {
            title: '政策法规 - 部门规章煤矿安监',
            source: [
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/bmgz_01/mkanj',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/bmgz_01',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr',
            ],
            target: '/zfxxgk/fdzdgknr/zcfg/bmgz_01/mkanj',
        },
        {
            title: '政策法规 - 部门规章非煤矿山',
            source: [
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/bmgz_01/fmks',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/bmgz_01',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr',
            ],
            target: '/zfxxgk/fdzdgknr/zcfg/bmgz_01/fmks',
        },
        {
            title: '政策法规 - 行业标准',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/hybz_01', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/zcfg/hybz_01',
        },
        {
            title: '政策法规 - 行业标准煤矿安监',
            source: [
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/hybz_01/mkanj',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/hybz_01',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr',
            ],
            target: '/zfxxgk/fdzdgknr/zcfg/hybz_01/mkanj',
        },
        {
            title: '政策法规 - 行业标准非煤矿山',
            source: [
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/hybz_01/fmks',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg/hybz_01',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/zcfg',
                'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr',
            ],
            target: '/zfxxgk/fdzdgknr/zcfg/hybz_01/fmks',
        },
        {
            title: '事故查处 - 事故通报',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc/sgtb', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc/sgtb',
        },
        {
            title: '事故查处 - 事故督办',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc/sgdb', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc/sgdb',
        },
        {
            title: '事故查处 - 事故调查报告',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc/sgbg', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc/sgbg',
        },
        {
            title: '事故查处 - 事故案例',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc/sgalks', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc/sgalks',
        },
        {
            title: '事故查处 - 事故警示教育片',
            source: ['www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc/sgjsjy', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr/sgcc', 'www.chinamine-safety.gov.cn/zfxxgk/fdzdgknr'],
            target: '/zfxxgk/fdzdgknr/sgcc/sgjsjy',
        },
    ],
    maintainers: ['nczitzk'],
    handler,
    description: `| 政府信息公开指南 | 政府信息公开制度 |
| ---------------- | ---------------- |
| zfxxgkzn         | zfxxgkzd         |

<details>
<summary>更多分类</summary>

#### 法定主动公开内容

| 分类         | id                    |
| ------------ | --------------------- |
| 通知公告     | fdzdgknr/tzgg         |
| 征求意见     | fdzdgknr/zqyj\\_01     |
| 政策法规     | fdzdgknr/zcfg         |
| 规划计划     | fdzdgknr/ghjh         |
| 政策解读     | fdzdgknr/zcjd         |
| 安全许可     | fdzdgknr/anqxk        |
| 事故查处     | fdzdgknr/sgcc         |
| 人事信息     | fdzdgknr/rsxx         |
| 财务信息     | fdzdgknr/cwxx         |
| 建议提案办理 | fdzdgknr/jytabl\\_4823 |

#### 法定主动公开内容 > 政策法规

| 分类             | id                           |
| ---------------- | ---------------------------- |
| 法律             | fdzdgknr/zcfg/fl\\_01         |
| 行政法规         | fdzdgknr/zcfg/xzfg           |
| 部门规章         | fdzdgknr/zcfg/bmgz\\_01       |
| 部门规章煤矿安监 | fdzdgknr/zcfg/bmgz\\_01/mkanj |
| 部门规章非煤矿山 | fdzdgknr/zcfg/bmgz\\_01/fmks  |
| 行业标准         | fdzdgknr/zcfg/hybz\\_01       |
| 行业标准煤矿安监 | fdzdgknr/zcfg/hybz\\_01/mkanj |
| 行业标准非煤矿山 | fdzdgknr/zcfg/hybz\\_01/fmks  |

#### 法定主动公开内容 > 事故查处

| 分类           | id                   |
| -------------- | -------------------- |
| 事故通报       | fdzdgknr/sgcc/sgtb   |
| 事故督办       | fdzdgknr/sgcc/sgdb   |
| 事故调查报告   | fdzdgknr/sgcc/sgbg   |
| 事故案例       | fdzdgknr/sgcc/sgalks |
| 事故警示教育片 | fdzdgknr/sgcc/sgjsjy |

</details>`,
};

async function handler(ctx) {
    const { category = 'fdzdgknr/tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const currentUrl = new URL(`zfxxgk/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul#ogi-list li a, div#ogi-list dd a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.contents().first().text(),
                link: new URL(item.prop('href'), currentUrl).href,
                pubDate: parseDate(item.parent().find('span').text()),
            };
        });

    items = await processItems(items, cache.tryGet);

    return {
        item: items,
        ...fetchData($, currentUrl),
    };
}
