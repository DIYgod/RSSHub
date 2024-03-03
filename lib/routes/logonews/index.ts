// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    isWork,
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.This_Article_content, .w_info').html(),
                });

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
