// @ts-nocheck
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const baseUrl = 'https://wechat2rss.xlab.app';
    const feedUrl = `${baseUrl}/feed/${id}.xml`;

    const { title, link, description, image, items: item } = await parser.parseURL(feedUrl);

    let items = item.map((i) => ({
        title: i.title,
        pubDate: parseDate(i.pubDate),
        link: i.link,
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(item)));

    ctx.set('data', {
        title,
        link,
        description,
        image: image.url,
        item: items,
    });
};
