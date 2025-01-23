import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/programme/:id?/:limit?/:isFull?',
    categories: ['traditional-media'],
    example: '/sctv/programme/1',
    parameters: { id: '节目 id，可在对应节目页中找到，默认为 `1`，即四川新闻联播', limit: '期数，默认为 15，即单次获取最新 15 期', isFull: '是否仅获取完整视频，填写 true/yes 表示是、false/no 表示否，默认是' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '电视回放',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  参数 **是否仅获取完整视频** 设置为 \`true\` \`yes\` \`t\` \`y\` 等值后，路由仅返回当期节目的完整视频，而不会返回节目所提供的节选视频。

  查看更多电视节目请前往 [电视回放](https://www.sctv.com/column/list)
:::

  | 节目                   | id      |
  | ---------------------- | ------- |
  | 四川新闻联播           | 1       |
  | 早安四川               | 2       |
  | 今日视点               | 3       |
  | 龙门阵摆四川           | 10523   |
  | 非常话题               | 1014756 |
  | 新闻现场               | 8385    |
  | 黄金三十分             | 8386    |
  | 全媒直播间             | 8434    |
  | 晚报十点半             | 8435    |
  | 现场快报               | 8436    |
  | 四川乡村新闻           | 3673    |
  | 四川文旅报道           | 8174    |
  | 乡村会客厅             | 3674    |
  | 金字招牌               | 3675    |
  | 问您所 “？”            | 3677    |
  | 蜀你最能               | 3679    |
  | 美丽乡村印象           | 3678    |
  | 美丽乡村               | 3676    |
  | 乡村大篷车             | 3680    |
  | 华西论健               | 3681    |
  | 乡村聚乐部             | 3682    |
  | 医保近距离             | 6403    |
  | 音你而来               | 7263    |
  | 吃八方                 | 7343    |
  | 世界那么大             | 7344    |
  | 风云川商               | 7345    |
  | 麻辣烫                 | 7346    |
  | 财经快报               | 7473    |
  | 医生来了               | 7873    |
  | 安逸的旅途             | 8383    |
  | 运动 +                 | 8433    |
  | 好戏连台               | 9733    |
  | 防癌大讲堂             | 1018673 |
  | 消费新观察             | 1017153 |
  | 天天耍大牌             | 1014753 |
  | 廉洁四川               | 1014754 |
  | 看世界                 | 1014755 |
  | 金熊猫说教育（资讯版） | 1014757 |
  | 她说                   | 1014759 |
  | 嗨宝贝                 | 1014762 |
  | 萌眼看世界             | 1014764 |
  | 乡村大讲堂             | 1014765 |
  | 四川党建               | 1014766 |
  | 健康四川               | 1014767 |
  | 技能四川               | 12023   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '1';
    const limit = ctx.req.param('limit') ? Number.parseInt(ctx.req.param('limit')) : 15;
    const isFull = /t|y/i.test(ctx.req.param('isFull') ?? 'true');

    const rootUrl = 'https://www.sctv.com';
    const apiRootUrl = 'https://kscgc.sctv-tf.com';
    const apiUrl = `${apiRootUrl}/sctv/lookback/${id}/date.json`;
    const listUrl = `${apiRootUrl}/sctv/lookback/index/lookbackList.json`;
    const currentUrl = `${rootUrl}/column/detail?programmeIndex=/sctv/lookback/${id}/index.json`;

    let response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = [];

    const array = response.data.data.programmeArray.slice(0, limit).map((list) => ({
        guid: list.id,
        link: `${apiRootUrl}${list.programmeListUrl}`,
    }));

    await Promise.all(
        array.map((list) =>
            cache.tryGet(list.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: list.link,
                });

                const currentItems = detailResponse.data.data.programmeList.map((item) => ({
                    guid: item.id,
                    title: item.programmeTitle,
                    link: item.programmeUrl,
                    pubDate: timezone(parseDate(item.pubTime), +8),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        cover: item.programmeImage,
                        video: item.programmeUrl,
                    }),
                }));

                let currentFullItems = [];

                if (isFull) {
                    currentFullItems = currentItems.filter((item) => /（\d{4}(?:\.\d{2}){2}）/.test(item.title));
                }

                items = [...items, ...(currentFullItems.length === 0 ? currentItems : currentFullItems)];
            })
        )
    );

    response = await got({
        method: 'get',
        url: listUrl,
    });

    let name, cover;
    for (const p of response.data.data.programme_official) {
        if (p.programmeId === id) {
            name = p.programmeName;
            cover = p.programmeCover;
            break;
        }
    }

    return {
        title: `四川广播电视台 - ${name}`,
        link: currentUrl,
        item: items.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100),
        image: cover,
    };
}
