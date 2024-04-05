import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt();

export const route: Route = {
    path: '/user/feed/:uid',
    categories: ['programming'],
    example: '/luogu/user/feed/1',
    parameters: { uid: '用户 UID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['luogu.com.cn/user/:uid'],
        },
    ],
    name: '用户动态',
    maintainers: ['solstice23'],
    handler,
};

async function handler(ctx) {
    const getUsernameFromUID = (uid) =>
        cache.tryGet('luogu:username:' + uid, async () => {
            const { data } = await got(`https://www.luogu.com.cn/user/${uid}?_contentOnly=1`);
            return data.currentData.user.name;
        });

    const uid = ctx.req.param('uid');
    const name = await getUsernameFromUID(uid);
    const { data: response } = await got(`https://www.luogu.com.cn/api/feed/list?user=${uid}`);

    const data = response.feeds.result;

    return {
        title: `${name} 的洛谷动态`,
        link: `https://www.luogu.com.cn/user/${uid}#activity`,
        allowEmpty: true,
        item: data.map((item) => ({
            title: item.content,
            description: md.render(item.content),
            pubDate: parseDate(item.time, 'X'),
            author: name,
            link: `https://www.luogu.com.cn/user/${uid}#activity`,
            guid: item.id,
        })),
    };
}
