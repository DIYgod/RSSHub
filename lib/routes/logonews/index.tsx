import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/work/tags/:tag', '/tag/:tag', '*'],
    radar: [
        {
            source: ['logonews.cn/work/tags/:tag'],
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
    description: `如 [中国 - 标志情报局](https://www.logonews.cn/tag/china) 的 URL 为 \`https://www.logonews.cn/tag/china\`，可得路由为 [\`/logonews/tag/china\`](https://rsshub.app/logonews/tag/china)。`,
};

async function handler(ctx) {
    const params = getSubPath(ctx);
    const isWork = params.indexOf('/work') === 0;

    const rootUrl = 'https://www.logonews.cn';
    const currentUrl = `${rootUrl}${params === '/' ? '' : params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(isWork ? 'h2 a' : 'a.article-link')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.iconfont').remove();

                content('img[data-src]').each(function () {
                    content(this).attr(
                        'src',
                        content(this)
                            .attr('data-src')
                            .replace(/_logonews/, '')
                    );
                });

                item.title = content('title').text();
                item.author = content('.author-links').text();
                item.pubDate = parseDate(content('meta[property="og:release_date"]').attr('content'));
                item.category = content('a.category_link, a[rel="tag"]')
                    .toArray()
                    .map((c) => content(c).text().replaceAll(' · ', ''));

                item.description = renderDescription(isWork, content('meta[property="og:image"]').attr('content'), content('.This_Article_content, .w_info').html());

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

const renderDescription = (isWork: boolean, image: string | undefined, description: string | null): string =>
    renderToString(
        <>
            {isWork ? <img src={image} /> : null}
            {description ? raw(description) : null}
        </>
    );
