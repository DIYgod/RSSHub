import { Route, Data } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/user/:uid',
    categories: ['bbs'],
    example: '/micommunity/user/1200057564',
    parameters: {
        uid: '小米用户 UID，可于网页版用户主页链接中 `uid` 项获取',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: '用户发帖',
    maintainers: ['abc1763613206'],
    handler,
};

const userRoot = 'https://web.vip.miui.com/page/info/mio/mio/homePage';
const apiRoot = 'https://api.vip.miui.com/api/community/user/announce/list';
const pageRoot = 'https://web.vip.miui.com/page/info/mio/mio/detail';

async function handler(ctx): Promise<Data> {
    const uid = ctx.req.param('uid');
    const apiLink = `${apiRoot}?uid=${uid}&limit=10`;
    const userLink = `${userRoot}?uid=${uid}`;
    const { data } = await got({
        method: 'get',
        url: apiLink,
        headers: {
            Referer: userLink,
        },
    });
    if (data.code === 200) {
        let authorName = '';
        const records = data.entity.records;
        const items = records.map((item) => {
            authorName = item.author.name;
            return {
                title: item.title ? item.title : `${authorName} 的动态`,
                description: item.textContent,
                pubDate: new Date(item.createTime).toUTCString(),
                author: item.author.name,
                link: `${pageRoot}?postId=${item.id}`,
                image: item.pic ? item.pic : item.cover ? item.cover : '',
            };
        });
        return {
            title: `小米社区 - ${authorName} 的发帖`,
            link: userLink,
            description: `${authorName} 的发帖`,
            item: items,
            language: 'zh-cn',
        };
    } else {
        throw new Error(data.message);
    }
}
