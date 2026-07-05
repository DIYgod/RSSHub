import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://zyk.bjhd.gov.cn';
const apiRootUrl = 'https://www.bjhd.gov.cn';
const refererUrl = 'https://www.beijing.gov.cn/';

const categories = {
    zcml: {
        title: '政策文件库',
        link: `${rootUrl}/zwdt/zcml/`,
    },
    gfxwj: {
        title: '政策文件意见征集',
        link: `${rootUrl}/zwdt/ygk/gfxwj/`,
    },
    zcjd: {
        title: '政策解读',
        link: `${rootUrl}/zwdt/zcjd/`,
    },
    ywdt: {
        title: '要闻动态',
        link: `${rootUrl}/ywdt/`,
    },
} as const;

type Category = keyof typeof categories;

function getHeaders(referer = refererUrl) {
    return {
        Referer: referer,
    };
}

export const route: Route = {
    path: '/bjhd/:category',
    categories: ['government'],
    example: '/gov/beijing/bjhd/zcml',
    parameters: { category: '栏目，见下表' },
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
            source: ['zyk.bjhd.gov.cn/zwdt/zcml/'],
            target: '/gov/beijing/bjhd/zcml',
        },
        {
            source: ['zyk.bjhd.gov.cn/zwdt/ygk/gfxwj/'],
            target: '/gov/beijing/bjhd/gfxwj',
        },
        {
            source: ['zyk.bjhd.gov.cn/zwdt/zcjd/'],
            target: '/gov/beijing/bjhd/zcjd',
        },
        {
            source: ['zyk.bjhd.gov.cn/ywdt/'],
            target: '/gov/beijing/bjhd/ywdt',
        },
    ],
    name: '北京市海淀区人民政府',
    maintainers: ['zll17'],
    handler,
    description: `| 政策文件库 | 政策文件意见征集 | 政策解读 | 要闻动态 |
| ---------- | ---------------- | -------- | -------- |
| zcml       | gfxwj            | zcjd     | ywdt     |`,
};

function pubDateFromArticleUrl(url: string) {
    const match = url.match(/\/t(\d{4})(\d{2})(\d{2})_/);
    if (!match) {
        return;
    }
    return timezone(parseDate(`${match[1]}-${match[2]}-${match[3]}`, 'YYYY-MM-DD'), 8);
}

function parseDocumentWriteArticles(html: string) {
    const items: DataItem[] = [];
    const seen = new Set<string>();
    const pattern = /document\.write\('<a href="(https?:\/\/(?:zyk\.)?bjhd\.gov\.cn[^"]+\.shtml)"[^>]*>(.*)<\/a>'\)/;

    for (const line of html.split('\n')) {
        const match = line.match(pattern);
        if (!match) {
            continue;
        }
        const link = match[1];
        if (seen.has(link) || !/\/t20\d{6}_\d+\.shtml/.test(link)) {
            continue;
        }
        seen.add(link);
        const title = match[2]
            .replaceAll(/<[^>]+>/g, '')
            .replaceAll(/\s+/g, ' ')
            .trim();
        if (!title) {
            continue;
        }
        items.push({
            title,
            link,
            pubDate: pubDateFromArticleUrl(link),
        });
    }

    return items;
}

function parseZcjdList(html: string) {
    const items: DataItem[] = [];
    const lines = html.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const linkMatch = line.match(/document\.write\('<a href="(https:\/\/zyk\.bjhd\.gov\.cn\/zwdt\/zcjd\/[^"]+\.shtml)"/);
        if (!linkMatch) {
            continue;
        }
        const titleMatch = line.match(/<\/i>([^<]+)<\/a>/);
        const dateMatch = lines[i + 1]?.match(/\[(\d{4}-\d{2}-\d{2})\]/);
        if (!titleMatch) {
            continue;
        }
        items.push({
            title: titleMatch[1].trim(),
            link: linkMatch[1],
            pubDate: dateMatch ? timezone(parseDate(dateMatch[1], 'YYYY-MM-DD'), 8) : undefined,
        });
    }

    return items;
}

async function fetchZcmlItems(limit: number) {
    const { data } = await got(`${apiRootUrl}/sjkf-api/haidian/data/catalog/search`, {
        headers: getHeaders(`${rootUrl}/zwdt/zcml/`),
        searchParams: {
            channelId: '76770,83277',
            pageNum: 1,
            pageSize: limit,
        },
    }).json<{
        rows: Array<{
            title: string;
            docPubUrl: string;
            pubDate: string;
            youxiaoxing: string;
            organCodeName: string;
            yearOfPublish: string;
            serialNumberOfPublish: string;
        }>;
    }>();

    return data.rows.map((item) => {
        const docNumber = item.organCodeName && item.yearOfPublish && item.serialNumberOfPublish ? `${item.organCodeName}〔${item.yearOfPublish}〕${item.serialNumberOfPublish}号` : undefined;

        return {
            title: item.title,
            link: item.docPubUrl,
            pubDate: timezone(parseDate(item.pubDate), 8),
            description: docNumber ? `<p>${docNumber}</p><p>${item.youxiaoxing === '1' ? '现行有效' : '失效'}</p>` : undefined,
        };
    });
}

function fetchGfxwjItems(html: string, limit: number) {
    const $ = load(html);
    const items: DataItem[] = [];

    $('ul.yjcgkList li').each((_, element) => {
        if (items.length >= limit) {
            return false;
        }
        const item = $(element);
        const anchor = item.find('a').first();
        const href = anchor.attr('href');
        const title = anchor.text().trim();
        if (!href || !title) {
            return;
        }
        const link = new URL(href, `${rootUrl}/zwdt/ygk/gfxwj/`).href;
        const period = item.find('p').first().text().trim();
        items.push({
            title,
            link,
            description: period || undefined,
        });
    });

    return items;
}

async function enrichItems(items: DataItem[], referer: string) {
    return await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: getHeaders(referer),
                });
                const $ = load(detailResponse.data);

                const pubDate = $('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                } else if (!item.pubDate) {
                    item.pubDate = pubDateFromArticleUrl(item.link);
                }

                item.author = $('meta[name="ContentSource"]').attr('content');
                item.description = $('#mainText').html() ?? item.description;

                return item;
            })
        )
    );
}

async function handler(ctx) {
    const category = ctx.req.param('category') as Category;
    const config = categories[category];

    if (!config) {
        throw new Error(`Invalid category: ${category}`);
    }

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    let items: DataItem[];

    switch (category) {
        case 'zcml':
            items = await fetchZcmlItems(limit);
            items = await enrichItems(items, config.link);
            break;
        case 'gfxwj': {
            const response = await got(config.link, {
                headers: getHeaders(config.link),
            });
            items = fetchGfxwjItems(response.data, limit);
            items = await enrichItems(items, config.link);
            break;
        }
        case 'zcjd': {
            const response = await got(config.link, {
                headers: getHeaders(config.link),
            });
            items = parseZcjdList(response.data).slice(0, limit);
            items = await enrichItems(items, config.link);
            break;
        }
        case 'ywdt': {
            const response = await got(config.link, {
                headers: getHeaders(config.link),
            });
            items = parseDocumentWriteArticles(response.data)
                .filter((item) => item.link.includes('/ywdt/') && !item.link.includes('/ywdt/jdt/'))
                .toSorted((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0))
                .slice(0, limit);
            items = await enrichItems(items, config.link);
            break;
        }
        default:
            throw new Error(`Unsupported category: ${category}`);
    }

    return {
        title: `北京市海淀区人民政府 - ${config.title}`,
        link: config.link,
        item: items,
    };
}
