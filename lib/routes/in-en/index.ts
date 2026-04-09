import { load } from 'cheerio';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 各子站配置：name=频道中文名，newsPath=新闻列表路径
const CATEGORIES: Record<string, { name: string; newsPath: string }> = {
    solar: { name: '光伏太阳能', newsPath: '/news/' },
    wind: { name: '风电', newsPath: '/windnews/' },
    chuneng: { name: '储能', newsPath: '/news/' },
    h2: { name: '氢能', newsPath: '/news/' },
    chd: { name: '充换电', newsPath: '/news/' },
    newenergy: { name: '新能源', newsPath: '/news/' },
    power: { name: '电力', newsPath: '/news/' },
    huanbao: { name: '环保', newsPath: '/news/' },
};

/**
 * 将列表页的相对时间文本（"X分钟前"、"X小时前"、"X天前"、"YYYY-MM-DD"）
 * 转换为 Date 对象（UTC+8 本地时）
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
        return new Date(now - n * offsets[m[2]]);
    }
    return parseDate(text) ?? undefined;
}

export const route: Route = {
    path: '/news/:type',
    categories: ['traditional-media'],
    example: '/in-en/news/solar',
    parameters: {
        type: '频道类型，见下表',
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
    maintainers: [],
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
            throw new Error(`未知的频道类型: ${type}，可选值: ${Object.keys(CATEGORIES).join(', ')}`);
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

                // 优先用 title 属性（完整标题），否则取文本并去掉「原创」标签
                const titleAttr = $a.attr('title')?.trim() ?? '';
                const titleText = $a.clone().children('span.OrigSign').remove().end().text().trim();
                const title = titleAttr || titleText;

                const pubDateRaw = $el.find('.listTxt .prompt i').first().text().trim();
                const author = $el.find('.listTxt .prompt span em.ly').first().text().trim();

                return {
                    title,
                    link,
                    author: author || undefined,
                    pubDate: timezone(parseRelTime(pubDateRaw), +8),
                } as DataItem;
            })
            .filter((item) => Boolean(item.title && item.link));

        // 并发抓取详情页正文（带缓存）
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    try {
                        const detail = await ofetch(item.link!);
                        const $d = load(detail);

                        // 正文
                        item.description = $d('.article-body').first().html() ?? '';

                        // 详情页有精确到日的发布时间，覆盖列表页的相对时间
                        const dateText = $d('.article-meta .date').first().text().replace('日期：', '').trim();
                        if (dateText) {
                            item.pubDate = timezone(parseDate(dateText), +8);
                        }

                        // 详情页来源可能比列表页更完整
                        const detailAuthor = $d('.article-meta .source a').first().text().trim();
                        if (detailAuthor) {
                            item.author = detailAuthor;
                        }
                    } catch {
                        // 详情页抓取失败时保留列表页数据
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
