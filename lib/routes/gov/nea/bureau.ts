import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/nea/sjzz/:bureau',
    categories: ['government'],
    example: '/gov/nea/sjzz/ghs',
    parameters: {
        bureau: {
            description: '司局',
            options: [
                { value: 'zhs', label: '综合司' },
                { value: 'fgs', label: '法改司' },
                { value: 'ghs', label: '规划司' },
                { value: 'kjs', label: '科技司' },
                { value: 'dls', label: '电力司' },
                { value: 'hds', label: '核电司' },
                { value: 'mts', label: '煤炭司' },
                { value: 'yqs', label: '油气司' },
                { value: 'xny', label: '新能源司' },
                { value: 'jgs', label: '监管司' },
                { value: 'aqs', label: '安全司' },
                { value: 'gjs', label: '国际司' },
                { value: 'jgdw', label: '机关党委（人事司）' },
            ],
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
            source: ['nea.gov.cn/sjzz/:bureau/index.htm'],
            target: '/nea/sjzz/:bureau',
        },
    ],
    name: '司工作进展',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    url: 'www.nea.gov.cn/',
};

async function handler(ctx) {
    const { bureau } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 35;

    const rootUrl = 'https://www.nea.gov.cn';
    const link = `${rootUrl}/sjzz/${bureau}/index.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const dataSourceId: string | undefined = $('ul#showData0').attr('data')?.split(/:/).pop();
    if (!dataSourceId) {
        throw new Error('Data source ID not found');
    }

    const jsonUrl = new URL(`ds_${dataSourceId}.json`, link).href;
    const jsonData: NeaResponse = await ofetch(jsonUrl);

    const list: DataItem[] = jsonData.datasource.slice(0, limit).map((item) => {
        const title = sanitizeHtml(item.title, { allowedTags: [], allowedAttributes: {} });

        return {
            title,
            link: new URL(item.publishUrl, rootUrl).href,
            pubDate: item.publishTime ? timezone(parseDate(item.publishTime), +8) : undefined,
            description: item.summary?.trim() || title,
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
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    item.title = $('meta[name="ArticleTitle"]').prop('content') || item.title;
                    item.description = $('#detailContent').html() || $('div.article-content').html() || item.description;
                    item.category = [...new Set([...(item.category ?? []), ...($('meta[name="keywords"]').attr('content')?.split(/,/) ?? [])])];
                    const detailPubDate = $('meta[name="PubDate"]').prop('content');
                    item.pubDate = detailPubDate ? timezone(parseDate(detailPubDate), +8) : item.pubDate;
                } catch {
                    //
                }
                return item;
            })
        )
    );

    return {
        title: `${$('head title').text()}${$('#tab03').text()}`,
        description: $('head meta[name="ColumnDescription"]').attr('content'),
        item: items,
        link,
    };
}

interface NeaItem {
    title: string;
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

interface NeaResponse {
    categoryName?: string;
    categoryDesc?: string;
    datasource: NeaItem[];
}
