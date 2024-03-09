import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/index', '/:category?'],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    description: `| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
  | -------- | -------- | -------- | -------- |
  | bbs      | zongban  | jinghua  | dianzan  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'zongban';

    const rootUrl = 'https://www.taoguba.com.cn';
    const currentUrl = `${rootUrl}/${category}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.items-comment-list')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 70)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.items-list-tittle a');
            a.find('b').remove();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
                author: item.find('.items-list-user a').text().trim(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                if (detailResponse.url.startsWith('https://www.taoguba.com.cn/topic/transfer')) {
                    item.description = '登录后查看完整文章';
                    return item;
                }

                const content = load(detailResponse.data);

                content('#videoImg').remove();
                content('img').each((_, img) => {
                    if (img.attribs.src2) {
                        img.attribs.src = img.attribs.src2;
                        delete img.attribs.src2;
                        delete img.attribs['data-original'];
                    }
                });

                item.description = content('#first').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.article-data span')
                            .eq(1)
                            .text()
                            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
                    ),
                    +8
                );
                item.category = content('.article-topic-list span')
                    .toArray()
                    .map((item) => $(item).text().trim());

                return item;
            })
        )
    );

    return {
        title: $('head title').text().trim().split('_')[0],
        link: currentUrl,
        item: items,
    };
}
