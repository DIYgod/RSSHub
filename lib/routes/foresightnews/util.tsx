import zlib from 'node:zlib';

import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { parseDate } from '@/utils/parse-date';
import type { Page } from '@/utils/playwright';
import { getPlaywrightPage } from '@/utils/playwright';

const constants = {
    labelHot: '热门',
    labelImportant: '重要消息',
    defaultType: 'article',
};

const params = {
    article: 'article',
    event: 'timeline',
    news: 'news',
};

const rootUrl = 'https://foresightnews.pro';
const apiRootUrl = 'https://api.foresightnews.pro';
const imgRootUrl = 'https://img.foresightnews.pro';

const icon = new URL('foresight.ico', rootUrl).href;
const image = new URL('vertical_logo.png', imgRootUrl).href;

const processItems = async (apiUrl, limit, ...parameters) => {
    let searchParams = {
        size: limit,
    };
    for (const param of parameters) {
        searchParams = {
            ...searchParams,
            ...param,
        };
    }

    const info = {
        column: '',
    };

    const requestUrl = new URL(apiUrl);
    for (const [key, value] of Object.entries(searchParams)) {
        requestUrl.searchParams.set(key, String(value));
    }

    // Cloudflare fingerprints the HTTP client, so browser-like headers alone are insufficient.
    let responsePromise: ReturnType<Page['waitForResponse']> | undefined;
    const { destroy } = await getPlaywrightPage(requestUrl.href, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                route.request().resourceType() === 'document' ? route.continue() : route.abort();
            });
            responsePromise = page.waitForResponse(requestUrl.href);
        },
    });
    let response;
    try {
        const apiResponse = await responsePromise!;
        response = await apiResponse.json();
    } finally {
        await destroy();
    }

    const buffer = Buffer.from(response.data?.list ?? response.data, 'base64');
    let items = JSON.parse(String(zlib.inflateSync(buffer)));

    items = (items?.list ?? items).slice(0, limit).map((item) => {
        const sourceType = item.source_type ?? (item.source_link ? (item.column?.title ? 'article' : 'news') : item.event_type ? 'event' : constants.defaultType);

        item = item.source_type ? item[item.source_type] : item;

        const column = item.column?.title;
        info.column ||= column;

        const categories = [
            column,
            item.event_type,
            item.is_hot ? constants.labelHot : undefined,
            item.is_important ? (item.important_tag?.name ?? constants.labelImportant) : '',
            item.label,
            ...(item.tags?.map((c) => c.name) ?? []),
        ].filter((v, index, self) => v && self.indexOf(v) === index);

        const link = new URL(`${params[sourceType]}/detail/${item.id}`, rootUrl).href;

        return {
            title: item.title,
            link,
            description: renderToString(
                <>
                    {raw(item.content ?? item.brief ?? '')}
                    {item.source_link ? (
                        <>
                            <br />
                            <a href={item.source_link}>来源链接</a>
                            <br />
                        </>
                    ) : null}
                    {item.img ? (
                        <figure>
                            <img src={item.img.split('?', 1)[0]} />
                        </figure>
                    ) : null}
                </>
            ),
            author: item.column?.title ?? item.author?.username,
            category: categories,
            guid: `foresightnews-${sourceType}#${item.id}`,
            pubDate: item.published_at ? parseDate(item.published_at * 1000) : undefined,
            updated: item.last_update_at ? parseDate(item.last_update_at * 1000) : undefined,
        };
    });

    return { items, info };
};

export { apiRootUrl, icon, image, imgRootUrl, processItems, rootUrl };
