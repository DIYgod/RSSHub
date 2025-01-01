import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/today/:category',
    categories: ['university'],
    example: '/hit/today/10',
    parameters: { category: '分类编号，`10`为公告公示，`11`为新闻快讯，同时支持详细分类，使用方法见下' },
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
            source: ['today.hit.edu.cn/category/:category'],
        },
    ],
    name: '今日哈工大',
    maintainers: ['ranpox'],
    handler,
    description: `::: tip
  今日哈工大的文章分为公告公示和新闻快讯，每个页面右侧列出了更详细的分类，其编号为每个 URL 路径的最后一个数字。
  例如会议讲座的路径为\`/taxonomy/term/10/25\`，则可以通过 [\`/hit/today/25\`](https://rsshub.app/hit/today/25) 订阅该详细类别。
:::

::: warning
  部分文章需要经过统一身份认证后才能阅读全文。
:::`,
};

async function handler(ctx) {
    const host = 'https://today.hit.edu.cn';
    const category = ctx.req.param('category');

    const response = await got(host + '/category/' + category, {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const list = $('.paragraph li')
        .toArray()
        .map((e) => ({
            link: new URL($('span span a', e).attr('href'), host).href,
            title: $('span span a', e).text(),
            author: $('div a', e).attr('hreflang', 'zh-hans').text(),
            pubDate: timezone(parseDate($('span span a', e).attr('href').split('/').slice(-4, -1).join(','), 'YYYYMMDD'), 8),
        }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link, {
                        headers: {
                            Referer: host,
                        },
                    });

                    const $ = load(response.data);
                    item.pubDate = timezone(parseDate($('.left-attr.first').text().trim()), 8);
                    item.description =
                        $('.article-content').html() &&
                        $('.article-content')
                            .html()
                            .replaceAll('src="/', `src="${new URL('.', host).href}`)
                            .replaceAll('href="/', `href="${new URL('.', host).href}`)
                            .trim();
                } catch {
                    // intranet
                    item.description = '请进行统一身份认证后查看全文';
                }
                return item;
            })
        )
    );

    return {
        title: $('head title').text().trim(),
        link: host + '/category/' + category,
        item: out,
    };
}
