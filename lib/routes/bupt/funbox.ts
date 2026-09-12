import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/funbox',
    categories: ['university'],
    example: '/bupt/funbox',
    name: 'BTBYR 趣味盒',
    maintainers: ['prnake'],
    handler,
    features: {
        requireConfig: [
            {
                name: 'BTBYR_HOST',
                description: '镜像站地址，默认为 `https://bt.byr.cn/`',
            },
            {
                name: 'BTBYR_COOKIE',
                description: '登陆 BTBYR 后的 Cookie 值',
            },
        ],
    },
    description: '由于需要登陆 BTBYR 后的 Cookie 值，所以只能自建，并且部署和订阅端均需支持 IPV6 网络或使用镜像站点。',
};

async function handler() {
    const cookie = config.btbyr.cookies;
    const url = config.btbyr.host || 'https://bt.byr.cn/';
    const response = await ofetch(`${url}log.php?action=funbox`, {
        headers: {
            Referer: url,
            Cookie: cookie ?? '',
        },
    });
    const $ = load(response);

    const list = $('td.outer > table > tbody')
        .slice(2)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const pubDate = timezone(parseDate($item.find('tr > td.rowfollow > span').attr('title')!), 8);
            return {
                title: $item.find('tr > td.rowfollow').eq(0).text(),
                pubDate,
                description: $item
                    .find('tr > td.rowfollow')
                    .eq(2)
                    .html()!
                    .replaceAll(/https:\/\/bt.byr.cn\//g, () => url)
                    .replaceAll(/onclick=.*findPosition\(this\)\[1\]-58\);"/g, '')
                    .replaceAll(/.thumb.jpg/g, ''),
                link: `${url}log.php?action=funbox`,
                guid: String(pubDate.getTime() / 1000),
            };
        });

    return {
        title: 'BTBYR - 趣味盒',
        link: `${url}log.php?action=funbox`,
        item: list,
    };
}
