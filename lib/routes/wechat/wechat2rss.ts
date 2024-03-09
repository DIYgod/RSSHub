import { Route } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/wechat2rss/:id',
    categories: ['new-media'],
    example: '/wechat/wechat2rss/5b925323244e9737c39285596c53e3a2f4a30774',
    parameters: { id: '公众号 id，打开 `https://wechat2rss.xlab.app/posts/list/`，在 URL 中找到 id；注意不是公众号页的 id，而是订阅的 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号（Wechat2RSS 来源）',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

    return {
        title,
        link,
        description,
        image: image.url,
        item: items,
    };
}
