import type { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { URL } from 'node:url';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/nea/sjzz/ghs',
    categories: ['government'],
    example: '/gov/nea/sjzz/ghs',
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
            source: ['nea.gov.cn/sjzz/ghs/'],
            target: '/nea/sjzz/ghs',
        },
    ],
    name: '发展规划司',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    url: 'www.nea.gov.cn/sjzz/ghs/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 35;

    const rootUrl = 'https://www.nea.gov.cn';
    const targetUrl: string = new URL('sjzz/ghs/', rootUrl).href;

    const response = await ofetch(targetUrl);
    const $ = load(response);

    const dataSourceId: string | undefined = $('ul#showData0').attr('data')?.split(/:/).pop();

    if (!dataSourceId) {
        throw new Error('Data source ID not found');
    }

    const jsonUrl = new URL(`ds_${dataSourceId}.json`, targetUrl).href;

    const jsonData: NeaGhsResponse = await ofetch(jsonUrl);

    const list: DataItem[] = jsonData.datasource.slice(0, limit).map((item) => {
        const itemLink = new URL(item.publishUrl, rootUrl).href;

        const $title = load(item.showTitle);
        const titleText = $title.text();

        return {
            title: titleText,
            link: itemLink,
            pubDate: item.publishTime ? timezone(parseDate(item.publishTime), +8) : undefined,
            description: item.summary?.trim() || titleText,
            author: [...new Set([item.sourceText, item.author, item.editor, item.responsibleEditor].filter(Boolean))].map((author) => ({
                name: author,
            })),
            category: item.keywords.split(/,/),
        };
    });

    const items = await Promise.all(
        list.map((item: DataItem) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);

                    item.title = content('meta[name="ArticleTitle"]').prop('content') || item.title;
                    item.description = content('td.detail').html() || content('div.article-content').html() || item.description;
                    item.category = [...new Set([...(item.category ?? []), ...(content('meta[name="keywords"]').attr('conetnt')?.split(/,/) ?? [])])];
                    const detailPubDate = content('meta[name="PubDate"]').prop('content');
                    item.pubDate = detailPubDate ? timezone(parseDate(detailPubDate), +8) : item.pubDate;
                } catch {
                    // logger.error(`Failed to fetch detail for ${item.link}`);
                }
                return item;
            })
        )
    );

    const filteredItems: DataItem[] = items.filter(Boolean) as DataItem[];

    return {
        item: filteredItems,
        title: '国家能源局 - 发展规划司工作进展',
        link: targetUrl,
        description: '国家能源局 - 发展规划司工作进展',
    };
}

interface NeaGhsItem {
    showTitle: string;
    publishUrl: string;
    publishTime: string;
    summary?: string;
    sourceText?: string;
    author?: string;
    editor?: string;
    responsibleEditor?: string;
    keywords: string;
}

interface NeaGhsResponse {
    categoryName?: string;
    categoryDesc?: string;
    datasource: NeaGhsItem[];
}
