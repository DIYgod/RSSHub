import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/exchangesys/:type',
    categories: ['university'],
    example: '/nju/exchangesys/proj',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '本科生交换生系统',
    maintainers: ['cqjjjzr'],
    handler,
    description: `| 新闻通知 | 交换生项目 |
| -------- | ---------- |
| news     | proj       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const type_dict = {
        news: ['http://elite.nju.edu.cn/exchangesystem/index/moreList', 'http://elite.nju.edu.cn/exchangesystem/index/more?type=xw', '新闻通知'],
        proj: ['http://elite.nju.edu.cn/exchangesystem/index/moreXmList', 'http://elite.nju.edu.cn/exchangesystem/index/more?type=xm', '交换生项目'],
    };

    if (!Object.hasOwn(type_dict, type)) {
        throw new InvalidParameterError('Unsupported type. Use news or proj.');
    }
    const url = type_dict[type][0] + '?page=1&limit=20&.me=c3lzLmluZGV4';
    const { data } = await got({
        url,
        headers: {
            Referer: type_dict[type][1],
        },
    });

    return {
        title: `本科生交换生管理系统-${type_dict[type][2]}`,
        link: type_dict[type][1],
        item:
            data &&
            data.data &&
            data.data.map((item) => {
                if (type === 'proj') {
                    return {
                        title: item.mc,
                        pubDate: [undefined, null, ''].includes(item.cjsj) ? undefined : parseDate(item.cjsj),
                        link: item.sqyq,
                    };
                }
                if (type === 'news') {
                    return {
                        title: item.bt,
                        author: item.createBy,
                        description: item.nr,
                        pubDate: [undefined, null, ''].includes(item.createDate) ? undefined : parseDate(item.createDate),
                        link: `http://elite.nju.edu.cn/exchangesystem/index/detail?pid=${item.pid}`,
                    };
                }
                return null;
            }),
    };
}
