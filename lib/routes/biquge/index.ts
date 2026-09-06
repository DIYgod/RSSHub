import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const allowHost = new Set([
    'www.xbiquwx.la',
    'www.biqu5200.net',
    'www.xbiquge.so',
    'www.biqugeu.net',
    'www.b520.cc',
    'www.ahfgb.com',
    'www.ibiquge.la',
    'www.biquge.tv',
    'www.bswtan.com',
    'www.biquge.co',
    'www.bqzhh.com',
    'www.biqugse.com',
    'www.ibiquge.info',
    'www.ishuquge.com',
    'www.mayiwxw.com',
]);

export const route: Route = {
    path: '/:url{.+}',
    categories: ['reading'],
    example: '/biquge/http://www.biqu5200.net/0_7/',
    parameters: { url: '小说 Url，即对应小说详情页的 Url，可在地址栏中找到' },
    features: {
        antiCrawler: true,
    },
    name: '小说',
    maintainers: ['jjeejj', 'machsix', 'nczitzk'],
    description: `::: tip

#### 使用方法

如订阅 [《大主宰》](http://www.biqu5200.net/0_7/)，此时在 [biqu5200.net](http://www.biqu5200.net) 中查询得到对应小说详情页 URL 为 \`http://www.biqu5200.net/0_7/\`。此时，路由为 [\`/biquge/http://www.biqu5200.net/0_7/\`](https://rsshub.app/biquge/http://www.biqu5200.net/0_7/)

又如同样订阅 [《大主宰》](https://www.shuquge.com/txt/70/index.html)，此时在 [shuquge.com](https://www.shuquge.com) 中查询得到对应小说详情页 URL 为 \`https://www.shuquge.com/txt/70/index.html\`。此时，把末尾的 \`index.html\` 去掉，路由为 [\`/biquge/https://www.shuquge.com/txt/70/\`](https://rsshub.app/biquge/https://www.shuquge.com/txt/70/)

#### 关于章节数

路由默认返回最新 **1** 个章节，如有需要一次性获取多个章节，可在路由后指定 \`limit\` 参数。如上面的例子：订阅 [《大主宰》](http://www.biqu5200.net/0_7/) 并获取最新的 **10** 个章节。此时，路由为 [\`/biquge/http://www.biqu5200.net/0_7/?limit=10\`](https://rsshub.app/biquge/http://www.biqu5200.net/0_7/?limit=10)

需要注意的是，单次获取的所有章节更新时间统一设定为最新章节的更新时间。也就是说，获取最新的 **10** 个章节时，除了最新 **1** 个章节的更新时间是准确的（和网站一致的），其他 **9** 个章节的更新时间是不准确的。

另外，若设置获取章节数目过多，可能会触发网站反爬，导致路由不可用。
:::

::: warning
上方列举的网址可能部分不可用，这取决于该网站的维护者是否持续运营网站。请选择可以正常访问的网址，获取更新的前提是该网站可以正常访问。
:::`,
    handler,
};

async function handler(ctx) {
    const currentUrl = ctx.req.param('url');
    const rootUrl = currentUrl.split('/').slice(0, 3).join('/');
    if (!config.feature.allow_user_supply_unsafe_domain && !allowHost.has(new URL(rootUrl).hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const response = await got(currentUrl, {
        responseType: 'buffer',
    });

    const isGBK = /charset="?'?gb/i.test(response.data.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    const $ = load(iconv.decode(response.data, encoding));
    const author = $('meta[property="og:novel:author"]').attr('content');
    const pubDate = timezone(parseDate($('meta[property="og:novel:update_time"]').attr('content')!), 8);

    let items = $('dl dd a')
        .toArray()
        .toReversed()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 1)
        .map((item): DataItem => {
            const $item = $(item);

            let link: string;
            const url = $item.attr('href');
            if (url!.startsWith('http')) {
                link = url!;
            } else if (url!.startsWith('/')) {
                link = `${rootUrl}${url}`;
            } else {
                link = `${currentUrl}/${url}`;
            }

            return {
                title: $item.text(),
                link,
                author,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });

                const content = load(iconv.decode(detailResponse.data, encoding));

                item.description = content('#content').html();

                return item;
            })
        )
    );

    return {
        title: `${$('meta[property="og:title"]').attr('content')} - 笔趣阁`,
        link: currentUrl,
        item: items,
    };
}
