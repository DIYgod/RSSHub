import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://news.ifeng.com';
    const currentUrl = `${rootUrl}${getSubPath(ctx).replace(/^\/news/, '')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const newsStream = JSON.parse(response.data.match(/"newsstream":(\[.*?]),"cooperation"/)[1]);

    let items = newsStream.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.newsTime), +8),
        description: item.thumbnails.image.pop(),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.author = detailResponse.data.match(/"editorName":"(.*?)",/)[1];
                item.category = detailResponse.data.match(/},"keywords":"(.*?)",/)[1].split(',');
                const image = item.description;
                const description = JSON.parse(detailResponse.data.match(/"contentList":(\[.*?]),/)[1]).map((content) => content.data);
                item.description = renderToString(
                    <>
                        {image ? (
                            <figure>
                                <img src={image.url} height={image.height} width={image.width} />
                            </figure>
                        ) : null}
                        {description?.length
                            ? description.map((entry) =>
                                  entry?.attachmentType === 'video' ? (
                                      <video controls poster={entry.bigPosterUrl}>
                                          <source src={entry.playUrl} />
                                      </video>
                                  ) : typeof entry === 'string' ? (
                                      <>{raw(entry.replaceAll('data-lazyload=', 'src='))}</>
                                  ) : null
                              )
                            : null}
                    </>
                );
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
