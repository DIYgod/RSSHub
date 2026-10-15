import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
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

type ListedNews = Omit<DataItem, 'description'> & { link: string; description?: { url: string; height?: number; width?: number } };

const isParagraph = (entry: string | ContentAttachment): entry is string => String(entry) === entry;

function parseNewsDate(value: string) {
    const date = value?.trim() ? parseDate(value.trim(), 'YYYY-MM-DD HH:mm:ss', true) : undefined;
    return date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 20);

    const path = ctx.req.param('path');
    const rootUrl = 'https://news.ifeng.com';
    const currentUrl = `${rootUrl}${path ? `/${path}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const newsStream = JSON.parse(response.data.match(/"newsstream":(\[.*?\]),"cooperation"/)[1]);

    const list: ListedNews[] = newsStream.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: parseNewsDate(item.newsTime),
        description: item.thumbnails.image.pop(),
    }));

    const items = await pMap(
        list,
        async (item) => {
            const response = await cache.tryGet(`ifeng:article-html:${item.link}`, async () => (await got(item.link)).data);
            const author = response.match(/"editorName":"(.*?)",/)[1];
            const category = response.match(/\},"keywords":"(.*?)",/)[1].split(',');
            const image = item.description;
            const contentList: Array<{ data: string | ContentAttachment }> = JSON.parse(response.match(/"contentList":(\[.*?\]),/)[1]);
            const description = contentList.map((content) => content.data);
            const content = renderToString(
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
            return { ...item, author, category, description: content };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
