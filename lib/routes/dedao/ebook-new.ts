import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://m.igetget.com/native/ebook/#/ebook/newBookList';
const apiUrl = 'https://m.igetget.com/native/api/ebook/getBookList';
const detailUrl = 'https://www.dedao.cn/ebook/detail';
const detailStatePattern = /window\.__INIT_PROVIDER_STATE__=(\{.*?\});window\.__INITIAL_STATE__/s;

type BookListItem = {
    enid?: string;
    title?: string;
    operating_title?: string;
    author?: string;
    author_list?: string[];
    book_name?: string;
    book_author?: string;
    cover?: string;
    uptime?: string;
    datetime?: string;
};

type BookListResponse = {
    c?: {
        list?: BookListItem[];
    };
};

type BaseInfoEntry = {
    text?: string;
    value?: string;
};

type DetailPress = {
    name?: string;
    brief?: string;
};

type CatalogEntry = {
    text?: string;
};

type DetailData = {
    authorList?: string[];
    bookAuthor?: string;
    bookIntro?: string;
    catalogList?: CatalogEntry[];
    classifyName?: string;
    count?: number;
    cover?: string;
    currentPrice?: string;
    originalPrice?: string;
    otherShareSummary?: string;
    press?: DetailPress;
    price?: string;
    rankName?: string;
};

type DetailState = {
    store?: {
        detailData?: DetailData;
        baseInfo?: BaseInfoEntry[];
    };
};

type DetailPayload = {
    detailData?: DetailData;
    baseInfo?: BaseInfoEntry[];
};

type DetailResult = {
    description?: string;
    category?: string[];
};

export const route: Route = {
    path: '/ebook/new',
    categories: ['reading'],
    example: '/dedao/ebook/new',
    name: '新书上架',
    maintainers: ['ZHA30'],
    radar: [
        {
            source: ['m.igetget.com/native/ebook/#/ebook/newBookList'],
            target: '/ebook/new',
        },
    ],
    handler,
    url: 'm.igetget.com/native/ebook/#/ebook/newBookList',
};

const formatText = (text: string): string => text.trim().replaceAll(/\r?\n/g, '<br>');

const parseDetailPayload = (html: string): DetailPayload | undefined => {
    const match = html.match(detailStatePattern);
    if (!match) {
        return undefined;
    }

    const normalized = match[1].replaceAll(/:\s*undefined/g, ':null').replaceAll(/:\s*NaN/g, ':null');

    try {
        const state = JSON.parse(normalized) as DetailState;
        return {
            detailData: state.store?.detailData,
            baseInfo: state.store?.baseInfo,
        };
    } catch {
        return undefined;
    }
};

const buildDescription = (payload?: DetailPayload): string | undefined => {
    const detailData = payload?.detailData;
    if (!detailData) {
        return undefined;
    }

    const blocks: string[] = [];
    const details: string[] = [];
    const usedLabels = new Set<string>();
    const baseInfo = payload?.baseInfo ?? [];
    const excludedLabels = new Set(['作者', '书名', '标题', '分类', '类型', '标签', '发行日期', '出版时间']);
    const isExcludedLabel = (label: string): boolean => {
        if (excludedLabels.has(label)) {
            return true;
        }
        if (detailData.classifyName && label === detailData.classifyName) {
            return true;
        }
        if (detailData.rankName && label === detailData.rankName) {
            return true;
        }
        return /日期|时间/.test(label);
    };
    const addDetail = (label: string, value: string): void => {
        const normalizedLabel = label.trim();
        const normalizedValue = value.trim();
        if (!normalizedLabel || !normalizedValue || usedLabels.has(normalizedLabel) || isExcludedLabel(normalizedLabel)) {
            return;
        }
        usedLabels.add(normalizedLabel);
        details.push(`<li>${normalizedLabel}：${normalizedValue}</li>`);
    };

    if (detailData.cover) {
        blocks.push(`<p><img src="${detailData.cover}" alt="封面"></p>`);
    }

    if (detailData.press?.name) {
        addDetail('出版社', detailData.press.name);
    }
    if (detailData.currentPrice || detailData.originalPrice || detailData.price) {
        const currentPrice = detailData.currentPrice || detailData.price || '';
        const originalPrice = detailData.originalPrice || '';
        const priceText = originalPrice && originalPrice !== currentPrice ? `${currentPrice}（原价 ${originalPrice}）` : currentPrice;
        if (priceText) {
            addDetail('定价', priceText);
        }
    }

    for (const info of baseInfo) {
        if (info?.text && info?.value) {
            addDetail(info.text, info.value);
        }
    }

    if (detailData.count && !usedLabels.has('字数')) {
        const wordCount = Math.round(detailData.count / 1000);
        addDetail('字数', `${wordCount}千字`);
    }

    if (detailData.otherShareSummary) {
        blocks.push(`<p>${formatText(detailData.otherShareSummary)}</p>`);
    }

    if (details.length) {
        blocks.push('<h3>书籍信息</h3>');
        blocks.push(`<ul>${details.join('')}</ul>`);
    }

    if (detailData.bookIntro) {
        blocks.push('<h3>内容简介</h3>');
        blocks.push(`<p>${formatText(detailData.bookIntro)}</p>`);
    }

    if (detailData.press?.brief) {
        blocks.push('<h3>出版社简介</h3>');
        blocks.push(`<p>${formatText(detailData.press.brief)}</p>`);
    }

    if (detailData.catalogList?.length) {
        const catalogItems = detailData.catalogList
            .map((entry) => entry.text)
            .filter(Boolean)
            .map((text) => `<li>${text}</li>`);

        if (catalogItems.length) {
            blocks.push(`<details><summary>目录</summary><ul>${catalogItems.join('')}</ul></details>`);
        }
    }

    return blocks.length ? `<section>${blocks.join('')}</section>` : undefined;
};

const fetchDetail = (link: string): Promise<DetailResult> =>
    cache.tryGet(link, async () => {
        const html = await ofetch<string, 'text'>(link, {
            responseType: 'text',
            headers: {
                'User-Agent': config.trueUA,
            },
        });
        const payload = parseDetailPayload(html);

        return {
            description: buildDescription(payload),
            category: payload?.detailData?.classifyName ? [payload.detailData.classifyName] : undefined,
        };
    });

async function handler() {
    const response = await ofetch<BookListResponse>(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Origin: 'https://m.igetget.com',
            Referer: 'https://m.igetget.com/native/ebook/',
            'User-Agent': config.trueUA,
            'Xi-DT': 'web',
        },
        body: {
            count: 20,
            max_id: 0,
            sort: 'time',
            since_id: 0,
        },
    });

    const items = await Promise.all(
        (response.c?.list ?? [])
            .filter((item) => item.enid)
            .map(async (item) => {
                const link = `${detailUrl}?id=${item.enid}`;
                const authors = item.author_list?.length ? item.author_list : item.author ? [item.author] : item.book_author ? [item.book_author] : undefined;
                const detail = await fetchDetail(link);

                return {
                    title: item.title || item.operating_title || item.book_name || '',
                    link,
                    author: authors?.join(', '),
                    description: detail.description,
                    category: detail.category,
                    pubDate: item.uptime ? parseDate(item.uptime) : item.datetime ? parseDate(item.datetime) : undefined,
                    image: item.cover || undefined,
                };
            })
    );

    return {
        title: '得到电子书 - 新书上架',
        link: rootUrl,
        item: items,
    };
}
