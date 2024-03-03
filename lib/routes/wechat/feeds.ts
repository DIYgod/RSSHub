// @ts-nocheck
import parser from '@/utils/rss-parser';
import { finishArticleItem } from '@/utils/wechat-mp';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `https://github.com/hellodword/wechat-feeds/raw/feeds/${id}.xml`;
    const feed = await parser.parseURL(link);

    const items = feed.items.map((item) => ({
        title: item.title,
        pubDate: new Date(item.pubDate),
        link: item.link,
        guid: item.link,
    }));
    await Promise.all(items.map((item) => finishArticleItem(item)));

    ctx.set('data', {
        title: feed.title,
        link,
        description: feed.description,
        item: items,
    });
};
