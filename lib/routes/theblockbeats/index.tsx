import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const domain = 'theblockbeats.info';
const rootUrl = `https://www.${domain}`;
const apiBase = 'https://api.blockbeats.cn';
const apiPrefix = '/v2';
const appKey = 'bb_demo_app';
const appSecret = 'bb_demo_secret_2026_01';
const originalAuthorPattern = /^(?:原文标题[：:][\s\S]*?)?原文作者[：:]\s*(\S[^\r\n]*)$/;

type ApiQuery = Record<string, number | string | undefined>;

type BlockBeatsItem = DataItem & {
    articleId: number;
    image?: string;
};

type BlockBeatsArticleDetails = {
    content?: string;
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

const cleanQuery = (query: ApiQuery) => Object.fromEntries(Object.entries(query).filter((entry): entry is [string, number | string] => entry[1] !== undefined));

const buildSignedHeaders = (path: string, query: Record<string, number | string>) => {
    const timestamp = Date.now().toString();
    const nonce = createNonce();
    const canonicalQuery = Object.keys(query)
        .toSorted((a, b) => a.localeCompare(b))
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
    let author: string | undefined;

    // Attribution headers precede the article; later quotations remain part of the body.
    $.root()
        .children()
        .each((_, element) => {
            const block = $(element);
            const text = block.text().trim();
            if (block.is('img, br') || !text) {
                return;
            }
            if (!block.is('blockquote')) {
                return false;
            }
            const match = originalAuthorPattern.exec(text);
            if (match) {
                author ||= match[1].trim();
                block.remove();
            } else if (/^原文标题[：:][^\r\n]+$/.test(text)) {
                block.remove();
            } else {
                return false;
            }
        });

    return { description: $.html(), author };
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

async function createArticleItem(item: BlockBeatsItem): Promise<BlockBeatsItem> {
    const details = await cache.tryGet(`theblockbeats:article:v2:${item.link}`, async (): Promise<BlockBeatsArticleDetails> => {
        const response = await fetchApi('/article/detail', { article_id: item.articleId });
        return { content: response.data.content, image: response.data.img_url };
    });
    const rendered = render({ image: details.image || item.image, description: details.content || item.description || undefined });

    return {
        ...item,
        description: rendered.description,
        author: rendered.author || item.author,
    };
}

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
|   0  |   1  |   2  |     3    |`,
};

async function handler(ctx) {
    const { channel = 'newsflash', original } = ctx.req.param();
    if (channel !== 'newsflash' && channel !== 'article') {
        throw new InvalidParameterError('Invalid channel. Use newsflash or article.');
    }

    const response = await fetchApi(channelMap[channel].api, {
        limit: getRouteLimit(ctx, 20),
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
        try {
            list = await pMap(list, createArticleItem, { concurrency: 3, stopOnError: false });
        } catch (error) {
            if (error instanceof AggregateError) {
                throw new AggregateError(error.errors, `BlockBeats article details failed: ${error.errors.map(String).join('; ')}`, { cause: error });
            }
            throw error;
        }
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
