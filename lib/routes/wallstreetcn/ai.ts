import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://wallstreetcn.com';
const apiRootUrl = 'https://api-one.wallstcn.com';
const sourceId = 'wallstreetcn-ai';
const link = `${rootUrl}/news/ai`;

export const route: Route = {
    path: '/ai',
    categories: ['finance'],
    example: '/wallstreetcn/ai',
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
            source: ['wallstreetcn.com/news/ai'],
            target: '/wallstreetcn/ai',
        },
    ],
    name: '\u786cAI',
    maintainers: ['maxlixiang'],
    handler,
    url: 'wallstreetcn.com/news/ai',
};

async function handler(ctx) {
    const limit = getLimit(ctx);
    const { data: response } = await got(`${apiRootUrl}/apiv1/content/information-flow`, {
        searchParams: {
            channel: sourceId,
            accept: 'article',
            limit: limit.toString(),
        },
        headers: commonHeaders,
    });

    let items = (response.data.items ?? [])
        .filter((item) => item.resource_type !== 'ad' && item.resource)
        .map((item) => {
            const resource = item.resource;

            return {
                type: item.resource_type,
                guid: resource.id,
                link: resource.uri,
                title: resource.title || resource.content_text,
                author: resource.source_name || resource.author?.display_name,
                description: resource.content || buildDescription(resource.content_text),
                pubDate: parseDate(resource.display_time * 1000),
                category: resource.asset_tags?.map((tag) => tag.name) ?? [],
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(getDetailApiUrl(item), {
                    headers: commonHeaders,
                });

                if (detailResponse.code !== 20000) {
                    return item;
                }

                const data = detailResponse.data;

                item.title = data.title || data.content_text || item.title;
                item.author = data.source_name || data.author?.display_name || item.author;
                item.description = data.content || data.content_text || item.description;
                item.category = data.asset_tags?.map((tag) => tag.name) ?? item.category;

                delete item.type;

                return item;
            })
        )
    );

    return {
        title: '\u534e\u5c14\u8857\u89c1\u95fb - \u786cAI',
        link,
        description: '\u534e\u5c14\u8857\u89c1\u95fb\u786cAI\u9891\u9053\u3002',
        item: items,
        image: 'https://static.wscn.net/wscn/_static/favicon.png',
    };
}

function getDetailApiUrl(item) {
    if (item.type === 'live') {
        return `${apiRootUrl}/apiv1/content/lives/${item.guid}`;
    }

    return `${apiRootUrl}/apiv1/content/articles/${item.guid}?extract=0`;
}

function getLimit(ctx) {
    const value = ctx.req.query('limit');
    const limit = value ? Number.parseInt(value, 10) : 25;

    return Number.isFinite(limit) && limit > 0 ? limit : 25;
}

function buildDescription(value?: string) {
    if (!value) {
        return '';
    }

    return `<p>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`;
}

function escapeHtml(value: string) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const commonHeaders = {
    referer: link,
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
};
