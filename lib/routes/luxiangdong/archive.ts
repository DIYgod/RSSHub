// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data } = await got(`https://www.luxiangdong.com/content.json?t=${Date.now()}`);

    const items = data.posts.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.permalink,
        // 文章发布日期
        pubDate: parseDate(item.date),
        // 如果有的话，文章作者
        author: data.meta.author,
        // 如果有的话，文章分类
        category: item.tags.map((tag) => tag.name),
    }));

    ctx.set('data', {
        // 源标题
        title: '土猛的员外',
        // 源链接
        link: 'https://www.luxiangdong.com/',
        // 源文章
        item: items,
    });
};
