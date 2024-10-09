import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { parseDyArticle } from './utils';

export const route: Route = {
    path: '/dy/:id',
    categories: ['new-media'],
    example: '/163/dy/W4983108759592548559',
    parameters: { id: '网易号 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '更新',
    maintainers: ['HendricksZheng'],
    handler,
    description: `1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
  2.  打开网易号的任意文章。
  3.  查看源代码，搜索 \`data-wemediaid\`，查看紧随其后的引号内的属性值（类似 \`W1966190042455428950\`）即为网易号 ID。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got(`https://dy.163.com/v2/article/list.do?pageNo=1&wemediaId=${id}&size=10`);

    const list = response.data.data.list.map((e) => ({
        title: e.title,
        link: 'https://www.163.com/dy/article/' + e.docid + '.html',
        pubDate: timezone(parseDate(e.ptime), 8),
        author: e.source,
        imgsrc: e.imgsrc,
    }));

    const items = await Promise.all(list.map((e) => parseDyArticle(e, cache.tryGet)));

    return {
        title: `网易号 - ${list[0].author}`,
        link: items[0].feedLink,
        description: items[0].feedDescription,
        image: items[0].feedImage,
        item: items,
    };
}
