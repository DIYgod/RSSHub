import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { getUserInfoFromUID } from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/article/:uid',
    categories: ['programming'],
    example: '/luogu/user/article/1',
    parameters: { name: '用户 UID' },
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
    name: '用户文章',
    maintainers: ['TonyRL'],
    handler,
};

const baseUrl = 'https://www.luogu.com';

async function handler(ctx) {
    const { uid } = ctx.req.param();

    const userInfo = await getUserInfoFromUID(uid);
    const response = await ofetch(`${baseUrl}/api/article/find`, {
        query: {
            user: uid,
            page: 1,
            ascending: false,
        },
    });

    const posts = response.articles.result.map((item) => ({
        title: item.title,
        link: `${baseUrl}/article/${item.lid}`,
        author: item.author.name,
        pubDate: parseDate(item.time, 'X'),
        description: item.content,
    }));

    const item = await Promise.all(
        posts.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);
                item.description = $('div#rendered-preview').html();

                return item;
            })
        )
    );

    return {
        title: `${userInfo.name} 的个人中心 - 洛谷 | 计算机科学教育新生态`,
        description: userInfo.description,
        link: `${baseUrl}/user/${uid}#article`,
        image: userInfo.avatar,
        item,
    };
}
