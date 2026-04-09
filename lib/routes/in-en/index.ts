import { load } from 'cheerio';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

// Subdomain config: name = channel display name, newsPath = news list path
const CATEGORIES: Record<string, { name: string; newsPath: string }> = {
    solar: { name: '光伏太阳能', newsPath: '/news/' },
    wind: { name: '风电', newsPath: '/windnews/' },
    chuneng: { name: '储能', newsPath: '/news/' },
    h2: { name: '氢能', newsPath: '/hydrogen/' },
    chd: { name: '充换电', newsPath: '/ChargingStation/' },
    newenergy: { name: '新能源', newsPath: '/news/' },
    power: { name: '电力', newsPath: '/news/' },
    huanbao: { name: '环保', newsPath: '/policy/' },
};

/**
 * Parse Chinese relative time strings ("X分钟前", "X小时前", "X天前") or
 * absolute date strings ("YYYY-MM-DD") into a Date object.
 * Returns undefined when input is empty.
 */
function parseRelTime(text: string): Date | undefined {
    if (!text) {
        return undefined;
    }
    const m = text.match(/^(\d+)(分钟|小时|天)前$/);
    if (m) {
        const n = Number.parseInt(m[1], 10);
        const now = Date.now();
        const offsets: Record<string, number> = {
            分钟: 60_000,
            小时: 3_600_000,
            天: 86_400_000,
        };
        // Returns an absolute UTC timestamp; no further timezone shift needed.
        return new Date(now - n * offsets[m[2]]);
    }
    return parseDate(text) ?? undefined;
}

export const route: Route = {
    path: '/news/:type',
    categories: ['traditional-media'],
    example: '/in-en/news/solar',
    parameters: {
        type: 'Channel type, see table below',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['Harviewang'],
    description: `| 频道 | type 参数 |
| --- | --- |
| 光伏太阳能 | solar |
| 风电 | wind |
| 储能 | chuneng |
| 氢能 | h2 |
| 充换电 | chd |
| 新能源综合 | newenergy |
| 电力 | power |
| 环保 | huanbao |`,

    async handler(ctx) {
        const type = ctx.req.param('type') ?? 'solar';
        const cat = CATEGORIES[type];
        if (!cat) {
            throw new Error(`Unknown channel type: ${type}. Valid values: ${Object.keys(CATEGORIES).join(', ')}`);
        }

        const baseUrl = `https://${type}.in-en.com`;
        const listUrl = `${baseUrl}${cat.newsPath}`;

        const html = await ofetch(listUrl);
        const $ = load(html);

        const list: DataItem[] = $('ul.infoList > li')
            .toArray()
            .map((el) => {
                const $el = $(el);
                const $a = $el.find('.listTxt h5 a');
                const link = $a.attr('href') ?? '';

                // Prefer title attribute (full title); fall back to text with OrigSign badge removed
                const titleAttr = $a.attr('title')?.trim() ?? '';
                const titleText = $a.clone().children('span.OrigSign').remove().end().text().trim();
                const title = titleAttr || titleText;

                const pubDateRaw = $el.find('.listTxt .prompt i').first().text().trim();
                const author = $el.find('.listTxt .prompt span em.ly').first().text().trim();

                return {
                    title,
                    link,
                    author: author || undefined,
                    // parseRelTime returns an absolute UTC Date; no extra timezone shift needed
                    pubDate: parseRelTime(pubDateRaw),
                } as DataItem;
            })
            .filter((item) => Boolean(item.title && item.link));

        // Fetch full article body concurrently with caching
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    try {
                        const detail = await ofetch(item.link!);
                        const $d = load(detail);

                        item.description = $d('.article-body').first().html() ?? '';

                        // Detail page source may be more complete than the list snippet
                        // Note: detail page only provides date-level precision (YYYY-MM-DD),
                        // so we keep the more precise relative timestamp from the list page.
                        const detailAuthor = $d('.article-meta .source a').first().text().trim();
                        if (detailAuthor) {
                            item.author = detailAuthor;
                        }
                    } catch {
                        // Keep list-page data if detail fetch fails
                    }
                    return item;
                })
            )
        );

        return {
            title: `国际能源网 · ${cat.name}`,
            link: listUrl,
            item: items as DataItem[],
        };
    },
};
