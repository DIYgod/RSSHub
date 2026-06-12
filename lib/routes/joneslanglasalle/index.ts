import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const searchApiUrl = 'https://www.jll.com/api/search/template';
const subscriptionKey = '8f6a4de5b0144673acaa89b03aac035e';

interface LocaleConfig {
    apiLang: string;
    countries: string[];
    insightsUrl: string;
    title: string;
}

// Reason: each locale maps to a different country filter, API language code, and site URL
const localeMap: Record<string, LocaleConfig> = {
    zh: {
        apiLang: 'zh-CN',
        countries: ['China Mainland'],
        insightsUrl: 'https://www.joneslanglasalle.com.cn/zh-cn/insights',
        title: '洞察 - 仲量联行JLL',
    },
    en: {
        apiLang: 'en-GB',
        countries: ['China Mainland'],
        insightsUrl: 'https://www.joneslanglasalle.com.cn/en-cn/insights',
        title: 'Insights - JLL China',
    },
    'zh-hk': {
        apiLang: 'zh-HK',
        countries: ['Hong Kong'],
        insightsUrl: 'https://www.jll.com/zh-hk/insights',
        title: '洞察 - 仲量聯行JLL 香港',
    },
    'en-hk': {
        apiLang: 'en-GB',
        countries: ['Hong Kong'],
        insightsUrl: 'https://www.jll.com/en-hk/insights',
        title: 'Insights - JLL Hong Kong',
    },
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { language: lang = 'zh' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const locale = localeMap[lang] || localeMap.zh;

    // Reason: site rebuilt with search API; old HTML scraping no longer works.
    // Using the public search API (Elasticsearch-backed) with subscription key from page JS.
    const response = await ofetch(searchApiUrl, {
        method: 'POST',
        headers: {
            'Subscription-Key': subscriptionKey,
            'Content-Type': 'application/json',
        },
        body: {
            id: 'jll_dynamic_list_search_template_v2',
            params: {
                size: limit,
                from: 0,
                countries: locale.countries,
                language: locale.apiLang,
                sort_by_relevance: false,
                includeGlobalPeople: false,
                boostCountry: '',
            },
        },
    });

    const items: DataItem[] = (response.hits?.hits || []).map((hit) => {
        const source = hit._source;
        return {
            title: source.title,
            description: source.description || source.subTitle || '',
            link: source.pageUrl,
            pubDate: source.datePublished ? parseDate(source.datePublished) : undefined,
            category: [...(source.topics || []), ...(source.industries || [])],
            image: source.imageUrl,
            banner: source.imageUrl,
            language: source.language,
        };
    });

    return {
        title: locale.title,
        link: locale.insightsUrl,
        item: items,
        allowEmpty: true,
        language: locale.apiLang,
    };
};

export const route: Route = {
    path: '/:language?/:category{.+}?',
    name: 'Trends & Insights',
    url: 'joneslanglasalle.com.cn',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    example: '/joneslanglasalle/en/trends-and-insights',
    parameters: {
        language: 'Language, `zh` for China Mainland Chinese, `en` for China Mainland English, `zh-hk` for Hong Kong Chinese, `en-hk` for Hong Kong English, `zh` by default',
        category: 'Category, `trends-and-insights` by default',
    },
    description: `::: tip
If you subscribe to [Trends & Insights (China)](https://www.joneslanglasalle.com.cn/en-cn/insights), use \`en\` as the language. For [Hong Kong Insights](https://www.jll.com/zh-hk/insights), use \`zh-hk\` as the language.
:::

| Region         | Language | Parameter |
| -------------- | -------- | --------- |
| China Mainland | 中文     | zh        |
| China Mainland | English  | en        |
| Hong Kong      | 中文     | zh-hk     |
| Hong Kong      | English  | en-hk     |`,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['joneslanglasalle.com.cn/:language/:category'],
            target: (params) => {
                const language = params.language;
                const category = params.category;

                return language ? `/${language}${category ? `/${category}` : ''}` : '';
            },
        },
        {
            title: 'Latest',
            source: ['joneslanglasalle.com.cn/en-cn/insights'],
            target: '/en/trends-and-insights',
        },
        {
            title: '房地产趋势与洞察',
            source: ['joneslanglasalle.com.cn/zh-cn/insights'],
            target: '/zh/trends-and-insights',
        },
        {
            source: ['jll.com/zh-hk/insights'],
            target: '/zh-hk/trends-and-insights',
        },
        {
            source: ['jll.com/en-hk/insights'],
            target: '/en-hk/trends-and-insights',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/:language?/:category{.+}?',
        name: '房地产趋势与洞察',
        url: 'joneslanglasalle.com.cn',
        maintainers: ['nczitzk', 'pseudoyu'],
        handler,
        example: '/joneslanglasalle/zh/trends-and-insights',
        parameters: {
            language: '语言，`zh` 为中国大陆中文，`en` 为中国大陆英文，`zh-hk` 为香港中文，`en-hk` 为香港英文，默认为 `zh`',
            category: '分类，默认为 `trends-and-insights`',
        },
        description: `::: tip
若订阅 [中国大陆洞察](https://www.joneslanglasalle.com.cn/zh-cn/insights)，语言参数为 \`zh\`。若订阅 [香港洞察](https://www.jll.com/zh-hk/insights)，语言参数为 \`zh-hk\`。
:::

| 地区     | 语言    | 参数  |
| -------- | ------- | ----- |
| 中国大陆 | 中文    | zh    |
| 中国大陆 | English | en    |
| 香港     | 中文    | zh-hk |
| 香港     | English | en-hk |`,
    },
};
