// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { parseItem } = require('./utils');

export default async (ctx) => {
    const { id: userId } = ctx.req.param();
    const currentUrl = 'https://www.gelonghui.com/api/community/dynamic/my-dynamics/v2';
    const { data } = await got(currentUrl, {
        searchParams: {
            article: true,
            userId,
            count: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 15,
        },
    });

    const list = data.result.map((item) => ({
        title: item.title,
        link: item.route,
        description: item.content,
        author: item.user.nick,
        pubDate: parseDate(item.createTimestamp, 'X'),
    }));

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `格隆汇 - 用户 ${data.result[0].user.nick} 的文章`,
        description: data.result.find((i) => i.user).user.brief,
        image: data.result.find((i) => i.user).user.avatar.split('@')[0],
        link: data.result.find((i) => i.user).user.route.replace('https://m.gelonghui.com', 'https://www.gelonghui.com'),
        item: items,
    });
};
