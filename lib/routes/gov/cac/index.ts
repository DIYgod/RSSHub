import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}',
    name: '通用',
    example: '/gov/cac/wxzw/xxh',
    parameters: { path: '路径，比如xxh表示信息化' },
    maintainers: ['drgnchan'],
    handler,
    description: `::: tip

路径填写对应页面 URL 中间部分。例如：

首页 > 网信政务 > 网信发布： <https://www.cac.gov.cn/wxzw/wxfb/A093702index_1.htm>
此时，path 参数为：/wxzw/wxfb

:::`,
};

async function handler(ctx) {
    const path = `/${ctx.req.param('path')}`;
    const host = 'https://www.cac.gov.cn';
    const homepage = `${host}/index.htm`;
    // Discover the current column URLs from the official homepage.
    const pathList = await cache.tryGet(
        'gov:cac:pathList',
        async () => {
            const { data: homepageResponse } = await got(homepage);
            const $ = load(homepageResponse);
            return $('a')
                .toArray()
                .map((item) => {
                    const href = $(item).attr('href');
                    if (href && /(?:http:)?\/\/www\.cac\.gov\.cn.*?\/A.*?\.htm/.test(href)) {
                        const matchArray = href.match(/(?:http:)?\/\/www\.cac\.gov\.cn(.*?)\/(A.*?\.htm)/);
                        if (matchArray && matchArray.length > 2) {
                            const path = matchArray[1];
                            const htmlName = matchArray[2];
                            return {
                                path,
                                completeUrl: `${host}${path}/${htmlName}`,
                            };
                        }
                    }
                    return null;
                })
                .filter(Boolean);
        },
        config.cache.routeExpire,
        false
    );

    const completeUrl = pathList.find((item) => item && item.path === path)?.completeUrl;
    const { data: channelResponse } = await got(completeUrl);
    const $1 = load(channelResponse);
    const items = $1('div#loadingInfoPage li')
        .toArray()
        .map((item) => {
            const c = $1(item);
            const a = c.find('a');
            const articleHref = a.attr('href');
            const title = a.text();
            const date = c.find('.times').text();
            return {
                link: new URL(articleHref!, completeUrl).href,
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
                title,
            };
        });
    return {
        title: $1('head title').text(),
        link: completeUrl,
        item: await Promise.all(
            items.map(async (item) => {
                const article = await cache.tryGet(`gov:cac:article:${item.link}`, async () => {
                    const { data: response } = await got(item.link);
                    const content = load(response);
                    const pubDate = content('#pubtime').text().trim();
                    return {
                        description: content('.main-content').html() ?? undefined,
                        pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY年MM月DD日 HH:mm'), 8) : undefined,
                    };
                });
                return {
                    ...item,
                    ...article,
                    pubDate: article.pubDate ?? item.pubDate,
                };
            })
        ),
    };
}
