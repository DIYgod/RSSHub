import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
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
    example: '/biquge/https://www.b520.cc/0_7/',
    parameters: { url: '小说 Url，即对应小说详情页的 Url，可在地址栏中找到' },
    features: {
        antiCrawler: true,
    },
    name: '小说',
    maintainers: ['jjeejj', 'machsix', 'nczitzk'],
    description: `::: tip

#### 使用方法

如订阅 [《大主宰》](https://www.b520.cc/0_7/)，此时在 [b520.cc](https://www.b520.cc) 中查询得到对应小说详情页 URL 为 \`https://www.b520.cc/0_7/\`。此时，路由为 [\`/biquge/https://www.b520.cc/0_7/\`](https://rsshub.app/biquge/https://www.b520.cc/0_7/)

#### 关于章节数

路由默认返回最新 **1** 个章节，如有需要一次性获取多个章节，可在路由后指定 \`limit\` 参数。如上面的例子：订阅 [《大主宰》](https://www.b520.cc/0_7/) 并指定最多获取最新的 **10** 个章节。此时，路由为 [\`/biquge/https://www.b520.cc/0_7/?limit=10\`](https://rsshub.app/biquge/https://www.b520.cc/0_7/?limit=10)

源站仅提供最新章节的更新时间，因此只有与源站最新章节信息匹配的条目包含更新时间，其他章节不提供时间。

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
    const latestChapterTitle = $('meta[property="og:novel:latest_chapter_name"]').attr('content');
    const updateTime = $('meta[property="og:novel:update_time"]').attr('content');
    const parsedDate = updateTime ? parseDate(updateTime) : undefined;
    const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined;
    const chapterLinks = new Set<string>();

    let items = $('dl dd a')
        .toArray()
        .toReversed()
        .filter((item) => {
            const href = $(item).attr('href');
            if (!href) {
                return false;
            }
            const url = new URL(href, currentUrl);
            if (url.pathname === '/' || chapterLinks.has(url.href)) {
                return false;
            }
            chapterLinks.add(url.href);
            return true;
        })
        .slice(0, getRouteLimit(ctx, 1))
        .map((item): DataItem => {
            const $item = $(item);

            const link = new URL($item.attr('href')!, currentUrl).href;

            return {
                title: $item.text(),
                link,
                author,
                pubDate: $item.text() === latestChapterTitle ? pubDate : undefined,
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
