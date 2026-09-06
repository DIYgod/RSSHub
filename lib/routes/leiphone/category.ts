import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/category/:catname',
    categories: ['new-media'],
    example: '/leiphone/category/industrynews',
    parameters: { catname: '网站顶部分类栏目' },
    description: `- 主栏目

| 业界         | 人工智能 | 智能驾驶       | 数智化          | 金融科技 | 医疗科技 | 芯片  | 政企安全   | 智慧城市  | 行业云        | 工业互联网         | AIoT |
| ------------ | -------- | -------------- | --------------- | -------- | -------- | ----- | ---------- | --------- | ------------- | ------------------ | ---- |
| industrynews | ai       | transportation | digitalindustry | fintech  | aihealth | chips | gbsecurity | smartcity | industrycloud | IndustrialInternet | iot  |

- 子栏目

- 人工智能

| 学术     | 开发者   |
| -------- | -------- |
| academic | yanxishe |

- 数智化

| 零售数智化 | 金融数智化 | 工业数智化 | 医疗数智化 | 城市数智化  |
| ---------- | ---------- | ---------- | ---------- | ----------- |
| redigital  | findigital | mandigital | medigital  | citydigital |

- 金融科技

| 科技巨头 | 银行 AI | 金融云       | 风控与安全   |
| -------- | ------- | ------------ | ------------ |
| BigTech  | bank    | FinanceCloud | DataSecurity |

- 医疗科技

| 医疗 AI  | 投融资 | 医疗器械 | 互联网医疗       | 生物医药     | 健康险       |
| -------- | ------ | -------- | ---------------- | ------------ | ------------ |
| healthai | touzi  | qixie    | hulianwangyiliao | shengwuyiyao | jiankangxian |

- 芯片

| 材料设备  | 芯片设计   | 晶圆代工      | 封装测试  |
| --------- | ---------- | ------------- | --------- |
| materials | chipdesign | manufacturing | packaging |

- 智慧城市

| 智慧安防      | 智慧教育       | 智慧交通            | 智慧社区       | 智慧零售       | 智慧政务        | 智慧地产 |
| ------------- | -------------- | ------------------- | -------------- | -------------- | --------------- | -------- |
| smartsecurity | smarteducation | smarttransportation | smartcommunity | smartretailing | smartgovernment | proptech |

- 工业互联网

| 工业软件   | 工业安全 | 5G 工业互联网 | 工业转型实践 |
| ---------- | -------- | ------------- | ------------ |
| gysoftware | gysafety | 5ggy          | gypratice    |

- AIoT

| 物联网 | 智能硬件 | 机器人 | 智能家居  |
| ------ | -------- | ------ | --------- |
| 5G     | arvr     | robot  | smarthome |`,
    radar: [
        {
            source: ['leiphone.com/category/:catname'],
            target: '/category/:catname',
        },
    ],
    name: '栏目',
    maintainers: ['vlcheng'],
    handler,
    url: 'leiphone.com/',
};

export async function handler(ctx) {
    const catname = ctx.req.param('catname');
    const rootUrl = 'https://www.leiphone.com';
    const url = catname ? `${rootUrl}/category/${catname}` : rootUrl;
    const res = await got.get(url);
    const $ = load(res.data);

    const list = $('.word > h3 > a')
        .slice(0, 10)
        .toArray()
        .map((e) => $(e).attr('href'));
    const items = await utils.ProcessFeed(list, cache);

    return {
        title: `雷峰网${catname ? ` ${catname}` : ''}`,
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
}
