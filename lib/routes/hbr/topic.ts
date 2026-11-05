import { load } from 'cheerio';
import { escape } from 'entities';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/topic/:topic?/:type?',
    categories: ['new-media'],
    example: '/hbr/topic/Leadership/From%20the%20Store',
    parameters: {
        topic: 'Topic, can be found in URL, Leadership by default',
        type: {
            description: 'Type, see below, Popular by default',
            options: [
                { value: 'Popular', label: 'Popular' },
                { value: 'From the Store', label: 'From the Store' },
                { value: 'For You', label: 'For You' },
            ],
            default: 'Popular',
        },
    },
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
            source: ['hbr.org/topic/:topic?', 'hbr.org/'],
        },
    ],
    name: 'Topic',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `HBR currently provides public product summaries for \`From the Store\`. The former \`Popular\` and \`For You\` topic streams are no longer published.

::: tip
Click here to view [All Topics](https://hbr.org/topics)
:::`,
};

async function handler(ctx) {
    const topic = ctx.req.param('topic') ?? 'Leadership';
    const type = ctx.req.param('type') ?? 'Popular';

    const rootUrl = 'https://hbr.org';
    const currentUrl = `${rootUrl}/topic/${topic}`;

    const response = await ofetch(currentUrl);

    const $ = load(response);
    const pageData = $('#__NEXT_DATA__').text();
    if (pageData) {
        if (type !== 'From the Store') {
            throw new Error(`HBR no longer publishes the ${type} topic feed. Use the From the Store type for its public store summaries.`);
        }
        return getStoreFeed(JSON.parse(pageData).props.pageProps, currentUrl);
    }

    const list = $(`stream-content[data-stream-name="${type}"]`)
        .find('.stream-item')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.attr('data-title')!,
                author: $item.attr('data-authors'),
                category: $item.attr('data-topic'),
                link: `${rootUrl}${$item.attr('data-url')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);

                const content = load(detailResponse);

                item.description = content('.article-body, article[itemprop="description"]').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);

                return item;
            })
        )
    );

    return {
        title: `${$('title').eq(0).text()} - ${type}`,
        link: currentUrl,
        item: items,
    };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface TopicPage {
    coveoAccessToken: string;
    topicFilterExpression: string;
    topicDisplayName: string;
    appConfig: { storeBaseUrl: string };
    staticState: {
        searchAction: { payload: { requestExecuted: { [key: string]: JsonValue } & { url: string } } };
    };
}

interface StoreResult {
    title: string;
    uri: string;
    raw: {
        seo_title: string;
        product_core_id: string;
        abstract?: string;
        abstract_short?: string;
        author?: string[];
        hbr_subject?: string[];
        publication_date?: number;
    };
}

async function getStoreFeed(page: TopicPage, link: string) {
    const { url, ...request } = page.staticState.searchAction.payload.requestExecuted;
    delete request.organizationId;
    delete request.accessToken;
    if (!page.coveoAccessToken || !page.topicFilterExpression || !page.appConfig.storeBaseUrl) {
        throw new Error('HBR did not provide its public topic search configuration.');
    }
    const { results } = await ofetch<{ results: StoreResult[] }>(url, {
        method: 'POST',
        headers: { authorization: `Bearer ${page.coveoAccessToken}` },
        body: {
            ...request,
            tab: 'topic-hbr-store',
            cq: '@hbr_content_type==("Book","Case Study","Tool","Article Collection","Magazine Issue","Partner Article","Other Article","Quick Case")',
            aq: page.topicFilterExpression,
        },
    });
    return {
        title: `${page.topicDisplayName} - From the Store - Harvard Business Review`,
        link,
        item: results.map((result): DataItem => {
            const { raw } = result;
            if (!raw.seo_title || !raw.product_core_id || !result.uri.startsWith('product://')) {
                throw new Error('HBR returned a store result without its product identity.');
            }
            const productUrl = new URL(`/product/${raw.seo_title}/${raw.product_core_id}`, page.appConfig.storeBaseUrl);
            productUrl.searchParams.set('sku', result.uri.slice('product://'.length));
            return {
                title: result.title,
                link: productUrl.href,
                description: escape(raw.abstract ?? raw.abstract_short ?? ''),
                author: raw.author?.join(', '),
                category: raw.hbr_subject,
                pubDate: raw.publication_date === undefined ? undefined : parseDate(raw.publication_date, 'x'),
            };
        }),
    };
}
