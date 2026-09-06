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
    // 在首页查找出所有的目录完整路径，比如https://www.cac.gov.cn/wxzw/xxh/A093706index_1.htm
    // xxh --> {"path": "/xxh", "completeUrl": "https://www.cac.gov.cn/wxzw/xxh/A093706index_1.htm"}
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
            const date = parseDate(c.find('.times').text());
            return {
                link: articleHref,
                pubDate: timezone(date),
                title,
                description: title,
            };
        });
    return {
        title: $1('head title').text(),
        link: completeUrl,
        item: items,
    };
}
