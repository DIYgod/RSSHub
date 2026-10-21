import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Notice {
    GGID: string | number;
    JYFS: string | number;
    ZYLB: string | number;
    GGMC: string;
    GGFBSJ?: string;
}

export const route: Route = {
    path: '/:type?',
    categories: ['government'],
    example: '/zjgtjy/all',
    parameters: { type: '分类名' },
    name: '公告信息',
    maintainers: ['Fatpandac'],
    description: `| 全部公告 | 挂牌公告 | 拍卖公告 | 补充公告 |
| :------: | :------: | :------: | :------: |
|    all   |   gpgg   |   pmgg   |   bcgg   |`,
    handler,
};

async function handler(ctx) {
    const typeParam = ctx.req.param('type') ?? 'all';
    const type = typeParam === 'all' ? '' : typeParam.toUpperCase();
    const host = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeInfoList?pageSize=10&pageNumber=1&noticeType=${type}&sort=DESC`;

    const response = await ofetch<{ data: Notice[] }>(host);
    const data = response.data;

    const items = await pMap(
        data,
        async (item) => {
            const pageUrl = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeLandContentDetails?noticeId=${item.GGID}&transactionMode=${item.JYFS}`;
            const pageLink = `https://td.zjgtjy.cn/view/trade/announcement/detail?id=${item.GGID}&category=${item.ZYLB}&type=${item.JYFS}`;

            const desc = await cache.tryGet(pageUrl, async () => {
                let desc = await ofetch(pageUrl);
                desc = desc.queryNoticeContent.GGNR;

                desc = desc.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
                return desc;
            });

            return {
                title: item.GGMC,
                description: desc,
                link: pageLink,
                pubDate: item.GGFBSJ ? parseDate(item.GGFBSJ) : undefined,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '浙江土地使用权挂牌公告',
        link: 'https://td.zjgtjy.cn/',
        item: items,
    };
}
