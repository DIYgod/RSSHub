import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['design'],
    example: '/logonews',
    radar: [
        {
            source: ['logonews.cn/'],
            target: '/',
        },
    ],
    name: '首页',
    maintainers: ['nczitzk'],
    handler,
    url: 'logonews.cn/',
};

export async function handler(ctx) {
    const subPath = getSubPath(ctx);
    const isWork = subPath.startsWith('/work');

    const rootUrl = 'https://www.logonews.cn';
    const currentUrl = subPath === '/' ? rootUrl : `${rootUrl}${subPath}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(isWork ? 'h2 a' : 'a.article-link')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                link: $item.attr('href'),
                title: '',
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.iconfont').remove();

                content('img[data-src]').each((_, el) => {
                    content(el).attr(
                        'src',
                        content(el)
                            .attr('data-src')!
                            .replace(/_logonews/, '')
                    );
                });

                item.title = content('title').text();
                item.author = content('.author-links').text();
                item.pubDate = parseDate(content('meta[property="og:release_date"]').attr('content')!);
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
