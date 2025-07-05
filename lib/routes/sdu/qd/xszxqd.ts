import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://www.onlineqd.sdu.edu.cn/';

const typeMap = {
    'xttz-yjs': {
        title: '学团通知-研究生',
        url: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1027',
    },
    'xttz-bks': {
        title: '学团通知-本科生',
        url: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1025',
    },
    'xttz-tx': {
        title: '学团通知-团学',
        url: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1026',
    },
    'xttz-xl': {
        title: '学团通知-心理',
        url: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1029',
    },
    xtyw: {
        title: '学团要闻',
        url: 'list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1008',
    },
};

export const route: Route = {
    path: '/qd/xszxqd/:type?',
    categories: ['university'],
    example: '/sdu/qd/xszxqd/xtyw',
    parameters: { type: '默认为`xtyw`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '学生在线（青岛）',
    maintainers: ['kukeya'],
    handler,
    description: `| 学团通知-研究生 | 学团通知-本科生 | 学团通知-团学 | 学团通知-心理 | 学团要闻
| -------- | -------- |-------- |-------- |-------- |
| xttz-yjs   | xttz-bks  |  xttz-tx  | xttz-xl  | xtyw  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xtyw';
    const link = new URL(typeMap[type].url, host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.list_box li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            const link = a.attr('href').startsWith('tz_content') || a.attr('href').startsWith('content') ? host + a.attr('href') : a.attr('href');
            return {
                title: a.text().trim(),
                link,
                pubDate: parseDate(e.find('span').text().trim(), 'YYYY-MM-DD'),
            };
        });

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                const hostname = new URL(item.link).hostname;
                if (hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                }
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('.v_news_content').html();

                return item;
            })
        )
    );

    return {
        title: `山东大学学生在线（青岛）${typeMap[type].title}`,
        description: $('title').text(),
        link,
        item,
        icon: 'https://www.onlineqd.sdu.edu.cn/img/logo.png',
    };
}
