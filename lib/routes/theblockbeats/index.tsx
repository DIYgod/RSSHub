import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const domain = 'theblockbeats.info';
const rootUrl = `https://www.${domain}`;
const apiBase = 'https://api.blockbeats.cn';
const apiPrefix = '/v2';
const appKey = 'bb_demo_app';
const appSecret = 'bb_demo_secret_2026_01';

type ApiQuery = Record<string, number | string | undefined>;

type BlockBeatsItem = DataItem & {
    articleId: number;
    image?: string;
};

const createNonce = (length = 16) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nonce = '';

    for (let i = 0; i < length; i++) {
        nonce += chars[Math.floor(Math.random() * chars.length)];
    }

    return nonce;
};

const cleanQuery = (query: ApiQuery) => Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined)) as Record<string, number | string>;

const buildSignedHeaders = (path: string, query: Record<string, number | string>) => {
    const timestamp = Date.now().toString();
    const nonce = createNonce();
    const canonicalQuery = Object.keys(query)
        .toSorted()
        .map((key) => `${key}=${query[key] ?? ''}`)
        .join('&');
    const signature = CryptoJS.HmacSHA256(`GET|${path}|${timestamp}|${nonce}|${canonicalQuery}`, appSecret).toString();

    return {
        'X-App-Key': appKey,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'X-Encrypt': 'false',
    };
};

const fetchApi = (path: string, query: ApiQuery) => {
    const cleanedQuery = cleanQuery(query);

    return ofetch(`${apiBase}${apiPrefix}${path}`, {
        query: cleanedQuery,
        headers: buildSignedHeaders(`${apiPrefix}${path}`, cleanedQuery),
    });
};

const render = (data: { image?: string; description?: string }) => {
    const html = renderToString(<BlockBeatsDescription image={data.image} description={data.description} />);
    const $ = load(html, null, false);

    $('img').each((_, e) => {
        const $e = $(e);
        const src = $e.attr('src');
        $e.attr('src', src?.split('?')[0]);
    });

    return $.html();
};

const BlockBeatsDescription = ({ image, description }: { image?: string; description?: string }) => (
    <>
        {image ? (
            <>
                <img src={image} />
                <br />
            </>
        ) : null}
        {description ? raw(description) : null}
    </>
);

const channelMap = {
    newsflash: {
        title: '快讯',
        link: `${rootUrl}/newsflash`,
        api: '/newsflash/list',
    },
    article: {
        title: '文章',
        link: `${rootUrl}/article`,
        api: '/article/list',
    },
};

export const route: Route = {
    path: '/:channel?/:original?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/theblockbeats/newsflash',
    parameters: {
        channel: {
            description: '类型',
            options: [
                { value: 'newsflash', label: '快讯' },
                { value: 'article', label: '文章' },
            ],
            default: 'newsflash',
        },
        original: {
            description: '文章类型，仅 `channel` 为 `article` 时有效',
            options: [
                { value: '0', label: '全部' },
                { value: '1', label: '深度' },
                { value: '2', label: '精选' },
                { value: '3', label: '热点追踪' },
            ],
            default: '0',
        },
    },
    name: '新闻快讯',
    maintainers: ['Fatpandac', 'jameshih', 'DIYgod'],
    handler,
    radar: [
        {
            title: '文章',
            source: ['www.theblockbeats.info/article'],
            target: '/article',
        },
        {
            title: '快讯',
            source: ['www.theblockbeats.info/newsflash'],
            target: '/newsflash',
        },
    ],
    description: `|    快讯   |   文章  |
| :-------: | :-----: |
| newsflash | article |

| 全部 | 深度 | 精选 | 热点追踪 |
| :--: | :--: | :--: | :------: |
|      |  -2  |   1  |     2    |`,
};

async function handler(ctx) {
    const { channel = 'newsflash', original } = ctx.req.param();

    const response = await fetchApi(channelMap[channel].api, {
        limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20,
        original: channel === 'article' ? original : undefined,
    });

    let list: BlockBeatsItem[] = response.data.list.map((item) => ({
        title: item.title,
        link: `${rootUrl}/${channel === 'newsflash' ? 'flash' : 'news'}/${item.article_id}`,
        description: item.content ?? item.abstract,
        pubDate: parseDate(item.add_time, 'X'),
        author: item.author?.nickname,
        category: item.tag_list,
        articleId: item.article_id,
        image: item.img_url,
    }));

    if (channel !== 'newsflash') {
        list = await Promise.all(
            list.map((item) =>
                cache.tryGet(`theblockbeats:${item.link}`, async () => {
                    const response = await fetchApi('/article/detail', {
                        article_id: item.articleId,
                    });
                    item.description = render({
                        image: response.data.img_url || item.image,
                        description: response.data.content || item.description,
                    });
                    return item;
                })
            )
        );
    }

    const items = list.map(({ author, category, description, image, link, pubDate, title }) => ({
        title,
        link,
        description,
        pubDate,
        author,
        category,
        image,
    }));

    return {
        title: `TheBlockBeats - ${channelMap[channel].title}`,
        link: channelMap[channel].link,
        item: items,
    };
}
