import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tieba/user/:uid',
    categories: ['bbs'],
    example: '/baidu/tieba/user/斗鱼游戏君',
    parameters: { uid: '用户 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户帖子',
    maintainers: ['igxlin', 'nczitzk'],
    handler,
    description: `用户 ID 可以通过打开用户的主页后查看地址栏的 \`un\` 字段来获取。`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const response = await got(`https://tieba.baidu.com/home/main?un=${uid}`);

    const data = response.data;

    const $ = load(data);
    const name = $('span.userinfo_username').text();
    const list = $('div.n_right.clearfix');
    let imgurl;

    return {
        title: `${name} 的贴吧`,
        link: `https://tieba.baidu.com/home/main?un=${uid}`,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item).find('.n_contain');
                imgurl = item.find('ul.n_media.clearfix img').attr('original');
                return {
                    title: item.find('div.thread_name a').attr('title'),
                    pubDate: timezone(parseDate(item.parent().find('div .n_post_time').text(), ['YYYY-MM-DD', 'HH:mm']), +8),
                    description: `${item.find('div.n_txt').text()}<br><img src="${imgurl}">`,
                    link: item.find('div.thread_name a').attr('href'),
                };
            }),
    };
}
