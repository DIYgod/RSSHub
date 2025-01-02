import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
import { getUserInfoFromUID } from './utils';
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
            source: ['luogu.com/user/:uid'],
        },
        {
            source: ['luogu.com.cn/user/:uid'],
        },
    ],
    name: '用户动态',
    maintainers: ['solstice23'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const userInfo = await getUserInfoFromUID(uid);
    const { data: response } = await got(`https://www.luogu.com.cn/api/feed/list?user=${uid}`);

    const data = response.feeds.result;

    return {
        title: `${userInfo.name} 的洛谷动态`,
        description: userInfo.description,
        image: userInfo.avatar,
        link: `https://www.luogu.com.cn/user/${uid}#activity`,
        allowEmpty: true,
        item: data.map((item) => ({
            title: item.content,
            description: md.render(item.content),
            pubDate: parseDate(item.time, 'X'),
            author: userInfo.name,
            link: `https://www.luogu.com.cn/user/${uid}#activity`,
            guid: item.id,
        })),
    };
}
