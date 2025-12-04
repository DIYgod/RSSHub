import path from 'node:path';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/inquire/:category?/:select?/:keyword?',
    categories: ['finance'],
    example: '/szse/inquire',
    parameters: { category: '类型，见下表，默认为 `0` 即 主板', select: '函件类别, 见下表，默认为全部函件类别', keyword: '公司代码或简称，默认为空' },
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
            source: ['szse.cn/disclosure/supervision/inquire/index.html', 'szse.cn/'],
            target: '/inquire',
        },
    ],
    name: '问询函件',
    maintainers: ['Jeason0228', 'nczitzk'],
    handler,
    url: 'szse.cn/disclosure/supervision/inquire/index.html',
    description: `类型

| 主板 | 创业板 |
| ---- | ------ |
| 0    | 1      |

  函件类别

| 全部函件类别 | 非许可类重组问询函 | 问询函 | 违法违规线索分析报告 | 许可类重组问询函 | 监管函（会计师事务所模板） | 提请关注函（会计师事务所模板） | 年报问询函 | 向中介机构发函 | 半年报问询函 | 关注函 | 公司部函 | 三季报问询函 |
| ------------ | ------------------ | ------ | -------------------- | ---------------- | -------------------------- | ------------------------------ | ---------- | -------------- | ------------ | ------ | -------- | ------------ |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '0';
    const select = ctx.req.param('select') ?? '全部函件类别';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://www.szse.cn';
    const currentUrl = `${rootUrl}/api/report/ShowReport/data?SHOWTYPE=JSON&CATALOGID=main_wxhj&TABKEY=tab${Number.parseInt(category) + 2}${select === '全部函件类别' ? '' : `&selecthjlb=${select}`}${keyword ? `&txtZqdm=${keyword}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data[category];

    const items = data.data.map((item) => {
        item.ck = item.ck.match(/encode-open='\/(.*)'>详细内容/)[1];
        item.hfck = item.hfck.replace(/encode-open='\//, "encode-open='http://reportdocs.static.szse.cn/");

        return {
            title: `[${item.gsdm}] ${item.gsjc} (${item.hjlb})`,
            link: `http://reportdocs.static.szse.cn/${item.ck}`,
            pubDate: parseDate(item.fhrq),
            description: art(path.join(__dirname, 'templates/inquire.art'), {
                item,
            }),
        };
    });

    return {
        title: `深圳证券交易所 - 问询函件 - ${data.metadata.name}`,
        link: `${rootUrl}/disclosure/supervision/inquire/index.html`,
        item: items,
        description: `函件类别：${select}${keyword ? `; 公司代码或简称：${keyword}` : ''}`,
    };
}
