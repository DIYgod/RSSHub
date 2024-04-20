import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import utils from './utils';
const { TYPE, parseUrl } = utils;

export const route: Route = {
    path: '/:type?',
    categories: ['new-media'],
    example: '/dahecube',
    parameters: { type: '板块，见下表，默认为推荐' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['linbuxiao'],
    handler,
    description: `| 推荐      | 党史    | 豫股  | 财经     | 投教      | 金融    | 科创    | 投融   | 专栏   |
  | --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |
  | recommend | history | stock | business | education | finance | science | invest | column |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'recommend';
    const params = JSON.stringify({
        channelid: TYPE[type].id,
        pno: 1,
        psize: 15,
    });

    const res = await got({
        method: 'post',
        url: 'https://app.dahecube.com/napi/news/pc/list',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: params,
    });

    const list = res.data.data.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubtime, 'YYYY-MM-DD HH:ss:mm'),
        author: item.source,
        id: item.recid,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.id, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: 'https://app.dahecube.com/napi/news/pc/artinfo',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        artid: item.id,
                    }),
                });

                item.description = detailResponse.data.data.content;
                item.link = `https://www.dahecube.com/article.html?artid=${item.id}`;
                delete item.id;
                return item;
            })
        )
    );

    const ret = {
        title: '大河财立方',
        link: parseUrl(type),
        description: `大河财立方 ${TYPE[type].name}`,
        language: 'zh-cn',
        item: items,
    };

    ctx.set('json', ret);
    return ret;
}
