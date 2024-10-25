import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'http://www.cst.zju.edu.cn/';

const map = new Map([
    [0, { id: '', title: '浙大软件学院-全部通知' }],
    [1, { id: '32178/list.htm', title: '浙大软件学院-招生信息' }],
    [2, { id: '36216/list.htm', title: '浙大软件学院-教务管理' }],
    [3, { id: '36217/list.htm', title: '浙大软件学院-论文管理' }],
    [4, { id: '36224/list.htm', title: '浙大软件学院-思政工作' }],
    [5, { id: '36228/list.htm', title: '浙大软件学院-评奖评优' }],
    [6, { id: '36233/list.htm', title: '浙大软件学院-实习就业' }],
    [7, { id: '36235/list.htm', title: '浙大软件学院-国际实习' }],
    [8, { id: '36194/list.htm', title: '浙大软件学院-国内合作科研' }],
    [9, { id: '36246/list.htm', title: '浙大软件学院-国际合作科研' }],
    [10, { id: '36195/list.htm', title: '浙大软件学院-校园服务' }],
]);

async function getPage(id) {
    const res = await got({
        method: 'get',
        url: host + id,
    });

    const $ = load(res.data);
    const list = $('.lm_new').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(item.find('.fr').text()),
                    link: new URL(item.find('a').attr('href'), host).href,
                };
            })
            .get()
    );
}

export const route: Route = {
    path: '/cst/:type',
    categories: ['university'],
    example: '/zju/cst/0',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '软件学院',
    description: `| 全部通知 | 招生信息 | 教务管理 | 论文管理 | 思政工作 | 评奖评优 | 实习就业 | 国际实习 | 国内合作科研 | 国际合作科研 | 校园服务 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------------ | ------------ | -------- |
  | 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8            | 9            | 10       |`,
    maintainers: ['yonvenne', 'zwithz'],
    handler,
};

async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    const link = host + map.get(type).id;
    let items = [];
    if (type === 0) {
        const tasks = [];
        for (const value of map.values()) {
            tasks.push(getPage(value.id));
        }
        const results = await Promise.all(tasks);
        for (const result of results) {
            items = [...items, ...result];
        }
    } else {
        items = await getPage(map.get(type).id);
    }

    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: link,
                    },
                });
                const $ = load(response.data);
                item.description = $('.vid_wz').html();
                return item;
            })
        )
    );

    return {
        title: map.get(type).title,
        link,
        item: out,
    };
}
