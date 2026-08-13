import type { Context } from 'hono';
import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/cookbook',
    categories: ['programming'],
    example: '/openai/cookbook',
    parameters: {
        limit: '返回的文章数量，默认 30',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['developers.openai.com/cookbook', 'cookbook.openai.com/'],
        },
    ],
    url: 'developers.openai.com/cookbook',
    name: 'Cookbook',
    description: 'OpenAI Cookbook 提供了大量使用 OpenAI API 的实用指南和示例代码，涵盖了从基础到高级的各种主题，包括 GPT 模型、嵌入、函数调用、微调等。这里汇集了最新的 API 功能介绍和流行的应用案例，是开发者学习和应用 OpenAI 技术的宝贵资源。',
    maintainers: ['liyaozhong'],
    handler,
};

// 递归解码 Astro 组件 props 的序列化格式
// [0, value] → 标量；[1, [...]] → 数组；普通对象递归解码每个属性
function decodeAstroValue(val: unknown): unknown {
    if (Array.isArray(val)) {
        if (val.length === 2 && (val[0] === 0 || val[0] === 1)) {
            if (val[0] === 0) {
                return decodeAstroValue(val[1]);
            }
            if (Array.isArray(val[1])) {
                return val[1].map(decodeAstroValue);
            }
        }
        return val;
    }
    if (val !== null && typeof val === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(val)) {
            result[key] = decodeAstroValue(value);
        }
        return result;
    }
    return val;
}

interface CookbookEntry {
    title: string;
    date: string;
    slug: string;
    internal_path: string;
    description: string;
    tags: string[];
    authors?: { name: string }[];
    archived: boolean;
}

async function handler(ctx: Context) {
    const limit = Number.parseInt(ctx.req.query('limit') || '30');
    const rootUrl = 'https://developers.openai.com';
    const currentUrl = `${rootUrl}/cookbook/`;

    const response = await ofetch(currentUrl, {
        headers: { 'User-Agent': config.ua },
    });
    const $ = load(response);

    // 从 astro-island 的 props 属性中提取文章数据
    const propsRaw = $('astro-island[component-url*="CookbookSearchPage"]').attr('props');

    if (!propsRaw) {
        throw new Error('无法从页面中提取 CookbookSearchPage 组件数据');
    }

    // 解析 astro-island props JSON
    const props = JSON.parse(propsRaw) as { entries: [number, unknown[]] };
    const entriesArray = props.entries[1];

    if (!Array.isArray(entriesArray)) {
        throw new Error('CookbookSearchPage entries 格式异常');
    }

    const articles = entriesArray
        .map((item) => decodeAstroValue(item) as CookbookEntry | null)
        .filter((item): item is CookbookEntry => item !== null && typeof item === 'object' && 'title' in item)
        .filter((item) => !item.archived)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const items = await Promise.all(
        articles.slice(0, limit).map((item) =>
            cache.tryGet(`${rootUrl}/cookbook/${item.internal_path}`, async () => {
                const dataItem: DataItem = {
                    title: item.title,
                    link: `${rootUrl}/cookbook/${item.internal_path}`,
                    pubDate: parseDate(item.date),
                    category: item.tags,
                    description: item.description,
                };

                if (item.authors?.length > 0) {
                    dataItem.author = item.authors.map((a) => a.name).filter(Boolean).join(', ');
                }

                try {
                    const detailResponse = await ofetch(dataItem.link!, {
                        headers: { 'User-Agent': config.ua },
                    });
                    const $detail = load(detailResponse);
                    const content = $detail('article').first().html();
                    if (content) {
                        dataItem.description = content;
                    }
                } catch {
                    // 保留 props 中的 description 作为后备
                }

                return dataItem;
            })
        )
    );

    return {
        title: 'OpenAI Cookbook',
        link: currentUrl,
        item: items,
    };
}
