import { Route } from '@/types';

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/stats/*',
    name: '国家统计局 通用',
    url: 'www.stats.gov.cn',
    categories: ['government'],
    maintainers: ['bigfei', 'nczitzk', 'reply2future'],
    example: '/gov/stats/sj/zxfb',
    handler,
    radar: [
        {
            title: '国家统计局 通用',
            source: ['www.stats.gov.cn/*path'],
            target: '/gov/stats/*path',
        },
    ],
    description: `::: tip
路径处填写对应页面 URL 中 \`http://www.stats.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [数据 > 数据解读](http://www.stats.gov.cn/sj/sjjd/)
则将对应页面 URL \`http://www.stats.gov.cn/sj/sjjd/\` 中 \`http://www.stats.gov.cn/\` 后的字段 \`sj/sjjd\` 作为路径填入。
此时路由为 [\`/gov/stats/sj/sjjd\`](https://rsshub.app/gov/stats/sj/sjjd)

若订阅 [新闻 > 时政要闻 > 中央精神](http://www.stats.gov.cn/xw/szyw/zyjs/)
则将对应页面 URL \`http://www.stats.gov.cn/xw/szyw/zyjs/\` 中 \`http://www.stats.gov.cn/\`
后的字段 \`xw/szyw/zyjs\` 作为路径填入。此时路由为 [\`/gov/stats/xw/szyw/zyjs\`](https://rsshub.app/gov/stats/xw/szyw/zyjs)
:::`,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15;
    const rootUrl = 'http://www.stats.gov.cn';

    const { headers } = await ofetch.raw(rootUrl);
    const sid = headers
        ?.getSetCookie()
        .find((s) => s.startsWith('wzws_sessionid='))
        ?.split(';')[0] as string;

    const pathname = getSubPath(ctx) === '/stats' ? '/sj/zxfb/' : getSubPath(ctx).replace(/^\/stats(.*)/, '$1');
    const currentUrl = `${rootUrl}${pathname.endsWith('/') ? pathname : pathname + '/'}`;

    const response = await ofetch(currentUrl, {
        headers: {
            Cookie: sid,
            Referer: currentUrl,
        },
    });

    const $ = load(response);

    let items = $($('a.pchide').length === 0 ? 'a[title]' : '.list-content a.pchide')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.attr('title'),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, {
                    headers: {
                        Cookie: sid,
                        Referer: rootUrl,
                    },
                });

                const content = load(detailResponse);

                // articles from www.news.cn or www.gov.cn

                if (/(news\.cn|www\.gov\.cn)/.test(item.link)) {
                    if (content('.year').text()) {
                        item.pubDate = timezone(parseDate(`${content('.year').text()}/${content('.day').text()} ${content('.time').text()}`, 'YYYY/MM/DD HH:mm:ss'), +8);
                        item.author = content('.source')
                            .text()
                            .replace(/来源：/, '')
                            .trim();
                    } else {
                        content('.pages_print').remove();

                        const info = content('.info, .pages-date').text().split('来源：');
                        item.pubDate = timezone(parseDate(info[0].trim()), +8);
                        item.author = info.pop();
                    }

                    item.title = item.title || content('h1').first().text() || content('h2').first().text();
                    item.description = content('#detail, .xlcontent, .pages_content').html();

                    return item;
                }

                item.author = detailResponse.match(/来源：(.*?)</)?.[1]?.trim();

                content('.pchide').remove();

                item.title = item.title || content('div.detail-title h1').text();
                item.pubDate = timezone(parseDate(content('div.detail-title-des h2 p, .info').first().text().trim()), +8);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    description: content('.TRS_Editor').html() || content('.TRS_UEDITOR').html(),
                    attachments: content('a[oldsrc]')
                        .toArray()
                        .map((a) => {
                            a = $(a);
                            return {
                                link: new URL(a.attr('href'), item.link).href,
                                name: a.text().trim(),
                            };
                        }),
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
