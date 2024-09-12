import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/blog/:id', '/user/:id'],
    categories: ['finance'],
    example: '/taoguba/blog/252069',
    parameters: { id: '博客 id，可在对应博客页中找到' },
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
            source: ['taoguba.com.cn/blog/:id', 'taoguba.com.cn/'],
        },
    ],
    name: '用户博客',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.taoguba.com.cn';
    const currentUrl = `${rootUrl}/blog/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const author = $('meta[property="og:author"]').attr('content');

    let items = $('.tittle_data')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
                author,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                if (detailResponse.url?.startsWith('https://www.taoguba.com.cn/topic/transfer')) {
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
        title: `淘股吧 - ${author}`,
        description: $('meta[http-equiv="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
}
