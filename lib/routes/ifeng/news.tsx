import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:path{.+}?',
    categories: ['new-media'],
    example: '/ifeng/news',
    parameters: { path: '路径，对应分类资讯页 URL 路径，默认为空' },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
路径处填写对应页面 URL 中 \`https://news.ifeng.com/\` 后的字段。下面是一个例子。

若订阅 [大湾区\\_资讯\\_凤凰网](https://news.ifeng.com/shanklist/3-305565-) 则将对应页面 URL \`https://news.ifeng.com/shanklist/3-305565-\` 中 \`https://news.ifeng.com/\` 后的字段 \`shanklist/3-305565-\` 作为路径填入。此时路由为 [\`/ifeng/news/shanklist/3-305565-\`](https://rsshub.app/ifeng/news/shanklist/3-305565-)
:::`,
};

type ContentAttachment = {
    attachmentType?: string;
    bigPosterUrl?: string;
    playUrl?: string;
};

const isParagraph = (entry: string | ContentAttachment): entry is string => String(entry) === entry;

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const path = ctx.req.param('path');
    const rootUrl = 'https://news.ifeng.com';
    const currentUrl = `${rootUrl}${path ? `/${path}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const newsStream = JSON.parse(response.data.match(/"newsstream":(\[.*?\]),"cooperation"/)[1]);

    let items = newsStream.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.newsTime), 8),
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
                item.category = detailResponse.data.match(/\},"keywords":"(.*?)",/)[1].split(',');
                const image = item.description;
                const contentList = JSON.parse(detailResponse.data.match(/"contentList":(\[.*?\]),/)[1]) as Array<{ data: string | ContentAttachment }>;
                const description = contentList.map((content) => content.data);
                item.description = renderToString(
                    <>
                        {image ? (
                            <figure>
                                <img src={image.url} height={image.height} width={image.width} />
                            </figure>
                        ) : null}
                        {description?.length
                            ? description.map((entry) =>
                                  isParagraph(entry) ? (
                                      <>{raw(entry.replaceAll('data-lazyload=', 'src='))}</>
                                  ) : entry?.attachmentType === 'video' ? (
                                      <video controls poster={entry.bigPosterUrl}>
                                          <source src={entry.playUrl} />
                                      </video>
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
