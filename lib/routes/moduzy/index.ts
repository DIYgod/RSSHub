import { Result, Vod } from '@/routes/moduzy/type';
import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { getCurrentPath } from '@/utils/helpers';

const render = (vod: Vod, link: string) => art(path.join(getCurrentPath(import.meta.url), 'templates', 'vod.art'), { vod, link });

export const route: Route = {
    path: '/:type/:hours?',
    categories: ['multimedia'],
    example: '/moduzy/2',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    parameters: {
        type: '类别ID，具体见下表，为 0 代表全部类别',
        hours: '获取截止到几小时前的数据，默认不限',
    },
    radar: [
        {
            source: ['moduzy.cc', 'moduzy.net', 'moduzy.com', 'moduzy1.com', 'moduzy2.com', 'moduzy3.com', 'moduzy4.com', 'moduzy5.com', 'moduzy6.com', 'moduzy7.com', 'moduzy8.com', 'moduzy9.com', 'moduzy10.com'],
        },
    ],
    name: '最新资源',
    maintainers: ['hualiong'],
    url: 'moduzy.net',
    description: `
:::warning
不建议订阅**全部类别**和**国产动漫**，因为该类型每天的更新量会大幅超过单次抓取的最大上限20条而被截断（**温馨提醒**：该资源网以**动漫资源**为主，部分影视类别可能会没有资源）
:::

| 类别 | ID | 类别 | ID | 类别 | ID | 类别 | ID |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 国产动漫 | 1 | 日韩动漫 | 2 | 欧美动漫 | 3 | 港台动漫 | 4 |
| 动漫电影 | 5 | 里番动漫 | 6 | 动作片 | 10 | 喜剧片 | 11 |
| 爱情片 | 12 | 科幻片 | 13 | 恐怖片 | 14 | 剧情片 | 15 |
| 战争片 | 16 | 惊悚片 | 17 | 家庭片 | 18 | 古装片 | 19 |
| 历史片 | 20 | 悬疑片 | 21 | 犯罪片 | 22 | 灾难片 | 23 |
| 记录片 | 24 | 短片 | 25 | 国产剧 | 26 | 香港剧 | 27 |
| 韩国剧 | 28 | 欧美剧 | 29 | 台湾剧 | 30 | 日本剧 | 31 |
| 海外剧 | 32 | 泰国剧 | 33 | 大陆综艺 | 34 | 港台综艺 | 35 |
| 日韩综艺 | 36 | 欧美综艺 | 37 | 全部类别 | 0 |  |  |`,
    handler: async (ctx) => {
        const { type, hours = '' } = ctx.req.param();
        const query = async (pg: number) =>
            await ofetch<Result>('https://moduzy.net/api.php/provide/vod', {
                parseResponse: JSON.parse,
                query: { ac: 'detail', t: type || '', h: hours, pg },
            });

        const res = await query(1);

        const items: DataItem[] = res.list.map((each) => ({
            title: each.vod_name,
            image: each.vod_pic,
            link: `https://moduzy.net/vod/${each.vod_id}/`,
            guid: each.vod_play_url.match(/https:\/\/.+?\.m3u8/g)?.slice(-1)[0],
            pubDate: timezone(parseDate(each.vod_time, 'YYYY-MM-DD HH:mm:ss'), +8),
            category: [each.type_name, ...each.vod_class.split(',')],
            description: render(each, `https://moduzy.net/vod/${each.vod_id}/`) + each.vod_content,
        }));

        return {
            title: `最新${type && items.length ? items[0].category![0] : '资源'} - 魔都资源网`,
            link: 'https://moduzy.net',
            allowEmpty: true,
            language: 'zh-cn',
            item: items,
        };
    },
};
