import type { Route, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { URL } from 'url';
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
    const jsonUrl = new URL('sjzz/ghs/ds_99a01b29f9a24ab58f7d64b36489500e.json', rootUrl).href;

    const jsonData: NeaGhsResponse = await ofetch(jsonUrl);

    const list: InternalDataItem[] = jsonData.datasource.slice(0, limit).map((item) => {
        const itemLink = new URL(item.publishUrl, rootUrl).href;

        const $title = load(item.showTitle);
        const titleText = $title.text();

        return {
            title: titleText,
            link: itemLink,
            pubDate: parseDate(item.publishTime),
            description: item.summary?.trim() || titleText,
            author: item.sourceText?.trim() || undefined,
            category: [] as string[],
        };
    });

    const items = await Promise.all(
        list.map((item: InternalDataItem) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);

                    item.title = content('meta[name="ArticleTitle"]').prop('content') || item.title;
                    item.description = content('td.detail').html() || content('div.article-content td').html() || item.description;
                    item.author = content('meta[name="ContentSource"]').prop('content') || item.author;
                    item.category = content('meta[name="keywords"]').prop('content')?.split(/,/) ?? item.category;
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
        link: 'https://www.nea.gov.cn/sjzz/ghs/',
        description: '国家能源局 - 发展规划司工作进展',
    };
}

interface NeaGhsItem {
    showTitle: string;
    publishUrl: string;
    publishTime: string;
    summary?: string;
    sourceText?: string;
}

interface NeaGhsResponse {
    categoryName?: string;
    categoryDesc?: string;
    datasource: NeaGhsItem[];
}

interface InternalDataItem {
    title: string;
    link: string;
    pubDate: Date;
    description: string;
    author?: string;
    category: string[];
}
