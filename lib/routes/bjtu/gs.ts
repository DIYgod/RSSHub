import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'https://gs.bjtu.edu.cn';
const title = ' - 北京交通大学研究生院';
const sections = {
    noti_zs: { path: '/tzgg/zstzgg/index.htm', name: '通知公告_招生' },
    noti: { path: '/tzgg/qb/index.htm', name: '通知公告' },
    news: { path: '/xwdt/index.htm', name: '新闻动态' },
    py: { path: '/tzgg/pytzgg/index.htm', name: '培养' },
    xw: { path: '/tzgg/xwtzgg/index.htm', name: '学位' },
    bszs_zszt: { path: 'https://yzb.bjtu.edu.cn/bszs/index.htm', name: '博士招生 - 招生专题' },
    sszs_zszt: { path: 'https://yzb.bjtu.edu.cn/sszs/index.htm', name: '硕士招生 - 招生专题' },
    zsjz_zszt: { path: 'https://yzb.bjtu.edu.cn/zsjz/index.htm', name: '招生简章 - 招生专题' },
};

const getItem = (item: DataItem & { link: string }) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        return { ...item, description: $('.articleDiv').html() ?? undefined };
    });

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/bjtu/gs/noti',
    parameters: { type: 'Article type' },
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
            source: ['gs.bjtu.edu.cn'],
        },
    ],
    name: '研究生院',
    maintainers: ['E1nzbern'],
    handler,
    description: `| 文章来源            | 参数       |
| ------------------- | ---------- |
| 通知公告\\_招生      | noti\\_zs   |
| 通知公告            | noti       |
| 新闻动态            | news       |
| 培养                | py         |
| 学位                | xw         |
| 博士招生 - 招生专题 | bszs\\_zszt |
| 硕士招生 - 招生专题 | sszs\\_zszt |
| 招生简章 - 招生专题 | zsjz\\_zszt |

::: tip
文章来源的命名均来自研究生院网站标题。官网改版后，当前支持 noti\\_zs、noti、news、py、xw、bszs\\_zszt、sszs\\_zszt 和 zsjz\\_zszt；其余旧栏目没有可验证的对应列表。
最常用的几项有 “通知公告\\_招生”、“通知公告”、“博士招生 - 招生专题”、“硕士招生 - 招生专题”。
:::`,
};

async function handler(ctx) {
    const { type = 'noti' } = ctx.req.param();
    if (!Object.hasOwn(sections, type)) {
        throw new InvalidParameterError(`The "${type}" section no longer has a corresponding list on the current website. Available sections: ${Object.keys(sections).join(', ')}.`);
    }
    const section = sections[type as keyof typeof sections];
    const link = new URL(section.path, rootURL).href;
    const response = await ofetch(link);
    const $ = load(response);
    const list = $('.sub_right_list .list01 > li')
        .toArray()
        .map((element): DataItem & { link: string } => {
            const $item = $(element);
            return {
                title: $item.find('.timeListPartnerTitle').text(),
                link: new URL($item.find('a').attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.subListTime').text()), 8),
            };
        });
    const selectedList = list;
    return {
        title: `${section.name}${title}`,
        link,
        item: await Promise.all(selectedList.map((item) => getItem(item))),
    };
}
