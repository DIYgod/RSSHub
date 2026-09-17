import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cookbook',
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description:
        'OpenAI Cookbook 提供了大量使用 OpenAI API 的实用指南和示例代码，涵盖了从基础到高级的各种主题，包括 GPT 模型、嵌入、函数调用、微调等。这里汇集了最新的 API 功能介绍和流行的应用案例，是开发者学习和应用 OpenAI 技术的宝贵资源。',
    maintainers: ['liyaozhong'],
    radar: [
        {
            source: ['developers.openai.com/cookbook', 'cookbook.openai.com/'],
        },
    ],
    url: 'developers.openai.com/cookbook',
    handler,
    example: '/openai/cookbook',
    name: 'Cookbook',
};

// Recursively decode Astro component props serialization.
// [0, value] is a scalar; [1, [...]] is an array.
function decodeAstroValue(val: unknown): unknown {
    if (Array.isArray(val)) {
        return val[0] === 0 ? decodeAstroValue(val[1]) : val[1].map((item) => decodeAstroValue(item));
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
    internal_path: string;
    description?: string;
    tags?: string[];
    archived?: boolean;
    authors?: Array<{ name: string }>;
    authorAffiliations?: string[];
}

async function handler() {
    const rootUrl = 'https://developers.openai.com';
    const currentUrl = `${rootUrl}/cookbook`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    // Extract article data from the astro-island props attribute.
    const propsRaw = $('astro-island[component-url*="Cookbook"]').attr('props');

    if (!propsRaw) {
        throw new TypeError('Failed to extract Cookbook component data from the page');
    }

    // Parse the astro-island props JSON.
    const props = JSON.parse(propsRaw) as { entries: [number, unknown[]] };
    const entriesArray = props.entries[1];

    if (!Array.isArray(entriesArray)) {
        throw new TypeError('Unexpected Cookbook entries format');
    }

    const articles = entriesArray
        .map((item) => decodeAstroValue(item) as CookbookEntry | null)
        .filter((item): item is CookbookEntry => item !== null && typeof item === 'object' && 'title' in item)
        .filter((item) => !item.archived)
        .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const items = await Promise.all(
        articles.slice(0, 30).map((item) =>
            cache.tryGet(`${rootUrl}/cookbook/${item.internal_path}`, async () => {
                const link = `${rootUrl}/cookbook/${item.internal_path}`;
                const dataItem: DataItem = {
                    title: item.title,
                    link,
                    pubDate: parseDate(item.date),
                    category: item.tags ?? [],
                    description: item.description,
                };

                if (item.authorAffiliations?.length) {
                    dataItem.author = item.authorAffiliations.join(', ');
                } else if (item.authors?.length) {
                    dataItem.author = item.authors
                        .map((a) => a.name)
                        .filter(Boolean)
                        .join(', ');
                }

                const detailResponse = await ofetch(link);
                const $detail = load(detailResponse);
                const content = $detail('article').html();
                dataItem.description = content ?? dataItem.description;

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
