import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

interface ArticleItem {
    id: number;
    parentId: number;
    title: string;
    title2?: string;
    guideTitle?: string;
    author?: string;
    content?: string;
    point?: string[];
    type?: string;
}

interface PaperPage {
    id: number;
    paperNumber: string;
    paperBk: string;
    paperData: string;
    paperName: string;
    paperImg: string;
    paperPDF: string;
    inTime: number;
    type: number;
    webUrl: string;
    downloadPdf?: number;
    xyList: ArticleItem[];
}

interface EditionData {
    paperInfo: PaperPage[];
    bmMenu?: Array<{ paperBk: string; paperNumber: string }>;
}

interface ThumbnailItem {
    id: number;
    paperName: string;
    paperData: string;
    paperImg?: string;
    webUrl?: string;
}

interface ThumbnailResponse {
    code?: number;
    msg?: string;
    data?: ThumbnailItem[];
    timestamp?: number;
}

const getLatestPaperInfo = async (): Promise<ThumbnailItem> => {
    try {
        const response = await ofetch<ThumbnailResponse>('http://www.81.cn/thumbnail/thumbnail.json');
        const item = response?.data?.find((d) => d.paperName === '解放军报');
        if (item?.paperData) {
            return item;
        }
    } catch {
        // Fallback to backup API if primary endpoint fails
    }

    const fallbackResponse = await ofetch<ThumbnailResponse>('https://rmt-zuul.81.cn/api-paper/api/newestPaper');
    const fallbackItem = fallbackResponse?.data?.find((d) => d.paperName === '解放军报');
    if (fallbackItem?.paperData) {
        return fallbackItem;
    }

    throw new Error('Failed to retrieve newest Liberation Army Daily (解放军报) edition');
};

const fetchEditionData = (paperData: string) =>
    cache.tryGet(`81:jfjb:${paperData}`, async () => {
        const [year, month, day] = paperData.split('-', 3);
        const indexUrl = `http://www.81.cn/_szb/jfjb/${year}/${month}/${day}/index.json`;
        return await ofetch<EditionData>(indexUrl);
    });

const buildTitle = (xy: ArticleItem): string => {
    let title = xy.title ?? '';
    if (xy.guideTitle && /\S/.test(xy.guideTitle)) {
        title = title && /\S/.test(title) ? `${xy.guideTitle} ${title}` : xy.guideTitle;
    }
    if (xy.title2 && /\S/.test(xy.title2) && !/^\s*[■□]/.test(xy.title2)) {
        title = title && /\S/.test(title) ? (/^\s*(?:——|--)/.test(xy.title2) ? `${title}${xy.title2}` : `${title} —— ${xy.title2}`) : xy.title2;
    }
    return title || '无标题';
};

const extractAuthor = (xy: ArticleItem): string | undefined => {
    let author = xy.author
        ?.replace(/^[■□◆▲·•\s]+/, '')
        .replaceAll(/\s+/g, ' ')
        .trim();
    if (!author && xy.title2?.trim() && /^[■□]/.test(xy.title2.trim())) {
        author = xy.title2
            .replace(/^[■□◆▲·•\s]+/, '')
            .replaceAll(/\s+/g, ' ')
            .trim();
    }
    return author || undefined;
};

const matchPage = (page: PaperPage, req: string): boolean => {
    const trimmed = req.trim();
    const pageNumMatch = trimmed.match(/^第?(\d{1,2})版?$/);
    if (pageNumMatch) {
        const num = pageNumMatch[1].padStart(2, '0');
        return page.paperNumber === num || page.paperNumber.replace(/^0+/, '') === pageNumMatch[1];
    }
    return page.paperBk === trimmed || page.paperBk.includes(trimmed);
};

export const handler = async (ctx) => {
    const requestedPage = ctx.req.param('page');
    const limit = getRouteLimit(ctx, 100);

    const latestPaper = await getLatestPaperInfo();
    const paperData = latestPaper.paperData;

    const editionData = await fetchEditionData(paperData);
    if (!editionData?.paperInfo || editionData.paperInfo.length === 0) {
        throw new Error(`No paper edition data found for Liberation Army Daily on ${paperData}`);
    }

    const { paperInfo } = editionData;
    const targetPages = !requestedPage || requestedPage === 'all' ? paperInfo : paperInfo.filter((p) => matchPage(p, requestedPage));

    if (targetPages.length === 0) {
        throw new InvalidParameterError(`Liberation Army Daily page '${requestedPage}' not found in today's edition`);
    }

    const seenTitles = new Set<string>();
    const seenIds = new Set<number>();
    const items: DataItem[] = [];

    for (const page of targetPages) {
        const pubDate = timezone(parseDate(page.paperData, 'YYYY-MM-DD', true), 8);
        const articles = page.xyList ?? [];
        for (const xy of articles) {
            const title = buildTitle(xy);
            const isGenericTitle = /^(?:图片|短讯|快讯|广告)$/.test(xy.title?.trim() ?? '');

            if (isGenericTitle) {
                if (xy.id && seenIds.has(xy.id)) {
                    continue;
                }
            } else if (seenTitles.has(title)) {
                continue;
            }

            if (xy.id) {
                seenIds.add(xy.id);
            }
            seenTitles.add(title);

            const content = xy.content && /\S/.test(xy.content) ? xy.content : undefined;
            const author = extractAuthor(xy);
            const link = xy.id ? `http://www.81.cn/szb_223187/szbxq/index.html?paperName=jfjb&paperDate=${page.paperData}&paperNumber=${page.paperNumber}&articleid=${xy.id}` : page.webUrl;

            items.push({
                title,
                description: content,
                link,
                pubDate,
                author,
                category: [page.paperBk, `${page.paperNumber}版`],
            });
        }
    }

    const singleSelectedPage = targetPages.length === 1 ? targetPages[0] : undefined;
    let sectionTitle = '';
    if (singleSelectedPage) {
        sectionTitle = ` - ${singleSelectedPage.paperNumber}版 ${singleSelectedPage.paperBk}`;
    } else if (requestedPage && requestedPage !== 'all') {
        sectionTitle = ` - ${requestedPage}`;
    }

    const feedTitle = `解放军报${sectionTitle} - ${paperData}`;
    const feedLink = singleSelectedPage?.webUrl ?? `http://www.81.cn/szb_223187/szblb/index.html?paperNumber=01&paperName=jfjb&paperDate=${paperData}`;

    return {
        title: feedTitle,
        link: feedLink,
        item: items.slice(0, limit),
        sortItems: false,
        image: targetPages[0]?.paperImg ?? latestPaper.paperImg ?? 'http://www.81.cn/favicon.png',
        language: 'zh-CN' as const,
    };
};

export const route: Route = {
    path: '/jfjb/:page?',
    categories: ['traditional-media'],
    example: '/81/jfjb',
    parameters: { page: '版面编号或名称，如 `01`、`第1版` 或 `要闻`；使用 `all` 或留空获取全部版面' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: [
                'www.81.cn/szb_223187/szblb/index.html',
                'www.81.cn/szb_223187/szblb',
                'www.81.cn/szb_223187/szbxq/index.html',
                'www.81.cn/szb_223187/szbxq',
                '81.cn/szb_223187/szblb/index.html',
                '81.cn/szb_223187/szblb',
                '81.cn/szb_223187/szbxq/index.html',
                '81.cn/szb_223187/szbxq',
            ],
            target: '/jfjb',
        },
    ],
    name: '解放军报',
    maintainers: ['zhangsan-xyz'],
    handler,
    url: 'www.81.cn/szb_223187/szblb/index.html',
    description: '获取当日《解放军报》数字报（电子版）的全部文章或指定版面文章。如订阅 **01 版**，路由为 `/81/jfjb/01`（亦支持 `/81/jfjb/第1版`）；订阅 **军营观察**，路由为 `/81/jfjb/军营观察`。',
};
