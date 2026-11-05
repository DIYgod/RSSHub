import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { calculate } from './util';

export const route: Route = {
    path: '/user/:id',
    categories: ['game'],
    example: '/xiaoheihe/user/30664023',
    parameters: { id: '用户 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户动态',
    maintainers: ['tssujt'],
    handler,
};
async function handler(ctx) {
    const userId = ctx.req.param('id');
    const userResponse = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/bbs/app/profile/user/profile?lang=zh-cn&version=1.3.303&userid=${userId}`,
    });
    const username = userResponse.data.result?.account_detail?.username;
    if (typeof username !== 'string' || !username) {
        throw new Error('Xiaoheihe did not return a public user profile. Please retry later or check whether the source is available.');
    }
    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/bbs/app/profile/events?lang=zh-cn&version=1.3.303&userid=${userId}&list_type=moment`,
    });
    const moments = response.data.result?.moments;
    if (!Array.isArray(moments)) {
        throw new TypeError('Xiaoheihe did not return a public user activity list. Please retry later or check whether the source is available.');
    }
    const data = moments.filter((item) => item.linkid !== undefined);
    let items: Array<
        DataItem & {
            link: string;
            linkId?: string | number;
        }
    > = data.map((item) => ({
        linkId: item.linkid,
        link: `https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=${item.linkid}`,
        title: item.title,
        pubDate: parseDate(item.modify_at * 1000),
        description: item.description,
    }));
    items = await pMap(
        items,
        async ({ linkId, ...item }) => {
            const detail = await cache.tryGet(`xiaoheihe:user:article:v2:${item.link}`, async () => {
                const dataUrl = calculate(
                    `https://api.xiaoheihe.cn/bbs/app/api/share/data/?os_type=web&app=heybox&client_type=mobile&version=999.0.3&x_client_type=web&x_os_type=Mac&x_app=heybox&heybox_id=-1&offset=0&limit=3&link_id=${linkId}&use_concept_type=`
                );
                const dataResponse = await got({
                    method: 'get',
                    url: dataUrl,
                });
                const description = dataResponse.data.link?.content?.[0]?.text;
                if (typeof description !== 'string') {
                    throw new TypeError('Xiaoheihe did not return article text for this activity. Please retry later or check whether the source is available.');
                }
                return { description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: `${username} 的动态`,
        link: 'https://xiaoheihe.cn',
        item: items,
    };
}
