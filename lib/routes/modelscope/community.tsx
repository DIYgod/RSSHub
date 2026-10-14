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
    path: '/community',
    categories: ['programming'],
    example: '/modelscope/community',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['community.modelscope.cn/'],
        },
    ],
    name: 'DevPress 官方社区',
    maintainers: ['TonyRL'],
    handler,
    url: 'community.modelscope.cn/',
};

const renderDescription = (thumb, quote, content) =>
    renderToString(
        <>
            {thumb ? (
                <>
                    <img src={thumb} />
                    <br />
                </>
            ) : null}
            {quote ? <blockquote>{quote}</blockquote> : null}
            {content ? <>{raw(content)}</> : null}
        </>
    );

async function handler(ctx) {
    const baseUrl = 'https://modelscope.csdn.net';

    const { data } = await got.post(`${baseUrl}/v1/namespace_page/article`, {
        json: { id: 142373, notInMediaAidList: [], pageNum: 1, pageSize: getRouteLimit(ctx, 30) },
    });

    const articles: Array<DataItem & { link: string; thumb?: string }> = data.data.content.map((c) => ({
        title: c.content.name,
        description: c.content.desc,
        author: c.nickname,
        link: `${baseUrl}/${c.content.id}.html`,
        pubDate: timezone(parseDate(c.content.createdTime), 8),
        category: c.content.externalData.tags.map((t) => t.name),
        thumb: c.content.thumb,
    }));

    const items = await pMap(
        articles,
        async ({ thumb, ...item }) => {
            const body = await cache.tryGet(`${item.link}:article-content`, async () => {
                const { data } = await got(item.link);

                const $ = load(data);
                const initialState = $('script')
                    .toArray()
                    .map((element) => $(element).text())
                    .find((script) => script.includes('window.__INITIAL_STATE__'))
                    ?.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*\});?\s*$/)?.[1];
                if (!initialState) {
                    throw new Error(`Article content state was not found at ${item.link}`);
                }
                const initialData = JSON.parse(initialState);

                return { content: initialData.pageData.detail.ext.content };
            });
            return { ...item, description: renderDescription(thumb, item.description, body.content) };
        },
        { concurrency: 3 }
    );

    return {
        title: 'ModelScope魔搭社区-DevPress官方社区',
        description: 'ModelScope魔搭社区 DevPress官方社区-ModelScope旨在打造下一代开源的模型即服务共享平台，为泛AI开发者提供灵活、易用、低成本的一站式模型服务产品，让模型应用更简单。',
        image: 'https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico',
        link: baseUrl,
        item: items,
    };
}
