import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { calculate } from './util';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/xiaoheihe/news',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '游戏新闻',
    maintainers: ['tssujt'],
    handler,
};

async function handler() {
    const feedUrl = calculate(`https://api.xiaoheihe.cn/bbs/app/feeds/news?os_type=web&app=heybox&client_type=mobile&version=999.0.3&x_client_type=web&x_os_type=Mac&x_app=heybox&heybox_id=-1&appid=900018355&offset=0&limit=20`);
    const response = await got({
        method: 'get',
        url: feedUrl,
    });
    const data = response.data.result.links.filter((item) => item.linkid !== undefined);
    let items = data.map((item) => ({
        linkId: item.linkid,
        link: `https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=${item.linkid}`,
        title: item.title,
        pubDate: parseDate(item.modify_at * 1000),
        description: item.description,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const dataUrl = calculate(
                    `https://api.xiaoheihe.cn/bbs/app/api/share/data/?os_type=web&app=heybox&client_type=mobile&version=999.0.3&x_client_type=web&x_os_type=Mac&x_app=heybox&heybox_id=-1&offset=0&limit=3&link_id=${item.linkId}&use_concept_type=`
                );
                const dataResponse = await got({
                    method: 'get',
                    url: dataUrl,
                });
                item.description = dataResponse.data.link.content[0].text;
                delete item.linkId;
                return item;
            })
        )
    );

    return {
        title: `小黑盒游戏新闻`,
        link: `https://xiaoheihe.cn`,
        item: items,
    };
}
