import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const searchApiUrl = 'https://www.jll.com/api/search/template';
const subscriptionKey = '8f6a4de5b0144673acaa89b03aac035e';
const rootUrl = 'https://www.joneslanglasalle.com.cn';

// Reason: map old route language params to the API language code
const langMap: Record<string, string> = {
    zh: 'zh-cn',
    en: 'en-GB',
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { language: lang = 'zh' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const apiLang = langMap[lang] || lang;

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
                countries: ['China Mainland'],
                language: apiLang,
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

    const targetUrl = lang === 'en' ? `${rootUrl}/en-cn/insights` : `${rootUrl}/zh-cn/insights`;

    return {
        title: lang === 'en' ? 'Insights - JLL' : '洞察 - 仲量联行JLL',
        link: targetUrl,
        item: items,
        allowEmpty: true,
        language: apiLang,
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
        language: 'Language, `zh` by default',
        category: 'Category, `trends-and-insights` by default',
    },
    description: `::: tip
If you subscribe to [Trends & Insights](https://www.joneslanglasalle.com.cn/en-cn/insights)，where the URL is \`https://www.joneslanglasalle.com.cn/en-cn/insights\`, extract the part \`https://joneslanglasalle.com.cn/\` to the end. Use \`en\` and \`trends-and-insights\` as the parameters to fill in. Therefore, the route will be [\`/joneslanglasalle/en/trends-and-insights\`](https://rsshub.app/joneslanglasalle/en/trends-and-insights).
:::

| Category  | ID                            |
| --------- | ----------------------------- |
| Latest    | trends-and-insights           |
| Workplace | trends-and-insights/workplace |
| Investor  | trends-and-insights/investor  |
| Cities    | trends-and-insights/cities    |
| Research  | trends-and-insights/research  |
`,
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
            source: ['joneslanglasalle.com.cn/en/trends-and-insights', 'joneslanglasalle.com.cn/en-cn/insights'],
            target: '/en/trends-and-insights',
        },
        {
            title: '房地产趋势与洞察',
            source: ['joneslanglasalle.com.cn/zh/trends-and-insights', 'joneslanglasalle.com.cn/zh-cn/insights'],
            target: '/zh/trends-and-insights',
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
            language: '语言，默认为 `zh`，可在对应分类页 URL 中找到',
            category: '分类，默认为 `trends-and-insights`，可在对应分类页 URL 中找到',
        },
        description: `::: tip
若订阅 [房地产趋势与洞察](https://www.joneslanglasalle.com.cn/zh-cn/insights)，网址为 \`https://www.joneslanglasalle.com.cn/zh-cn/insights\`，请截取 \`https://joneslanglasalle.com.cn/\` 到末尾的部分 \`zh\` 和 \`trends-and-insights\` 作为 \`language\` 和 \`category\` 参数填入，此时目标路由为 [\`/joneslanglasalle/zh/trends-and-insights\`](https://rsshub.app/joneslanglasalle/zh/trends-and-insights)。
:::

| 分类名称   | 分类 ID                       |
| ---------- | ----------------------------- |
| 趋势及洞察 | trends-and-insights           |
| 办公空间   | trends-and-insights/workplace |
| 投资者     | trends-and-insights/investor  |
| 城市       | trends-and-insights/cities    |
| 研究报告   | trends-and-insights/research  |
`,
    },
};
