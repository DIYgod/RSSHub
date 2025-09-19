import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const handler = async (ctx) => {
    const BASE_URL = 'https://xwxy.gdufs.edu.cn';

    const category = ctx.req.param('category') ?? 'news';
    const pathMap: Record<string, string> = {
        news: '/xwzx/xyxw.htm',
        notices: '/xwzx/tzgg/tz.htm',
        announcements: '/xwzx/tzgg/gg.htm',
        media: '/xwzx/mtjj.htm',
    };
    const titleMap: Record<string, string> = {
        news: '学院新闻',
        notices: '通知',
        announcements: '公告',
        media: '媒体聚焦',
    };
    const datePattern = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/;

    const link = `${BASE_URL}${pathMap[category] ?? pathMap.news}`;

    const response = await got(link);
    if (!response.body) {
        throw new Error('No response body');
    }
    const $ = load(response.body);
    // 直接选择新闻列表项中的链接
    const anchors = $('li[id^="line_u14_"] a');

    const items = anchors
        .toArray()
        .map((el) => {
            const a = $(el);
            const href = a.attr('href') || '';
            const li = a.closest('li');
            const contextText = ((li && li.text()) || a.text()).trim();
            const dateText = a.find('i').text().trim() || (li && li.find('i').text().trim()) || (li && li.find('time').text().trim()) || (contextText.match(datePattern)?.[0] ?? '');
            const pubDate: Date | undefined = dateText ? parseDate(dateText) : undefined;
            const title = a.find('h5').text().trim() || a.attr('title')?.trim() || a.text().trim() || contextText.replace(datePattern, '').trim();
            // 过滤无效链接
            if (!href) {
                return null;
            }
            return {
                title,
                // 使用当前栏目页作为相对路径的解析基准，兼容 ../../info/xxx.htm
                link: href.startsWith('http') ? href : new URL(href, link).href,
                pubDate,
            };
        })
        .filter((v): v is { title: string; link: string; pubDate: Date | undefined } => !!v && !!v.title && !!v.link);

    // 尊重 limit 参数，默认 10（与仓库常见写法保持一致）
    const limit = Number.parseInt(ctx.req.query('limit') ?? '') || 10;
    const limitedItems = items.slice(0, limit);

    const enhancedItems = await Promise.all(
        limitedItems.map((item) =>
            cache.tryGet(item.link, async () => {
                // 外部链接直接返回基础信息，避免因跨域/不同模板导致解析失败
                let isInternal = false;
                try {
                    const u = new URL(item.link);
                    isInternal = u.hostname.endsWith('gdufs.edu.cn');
                } catch {
                    // ignore malformed URL
                }

                if (!isInternal) {
                    return {
                        ...item,
                        description: '',
                        author: '',
                    };
                }

                const articleResponse = await got(item.link);
                if (!articleResponse.body) {
                    throw new Error('No article body');
                }
                const $$ = load(articleResponse.body);
                // 使用 .v_news_content 选择器
                const $content = $$('.v_news_content');

                // 绝对化 img/src 与 a/href
                $content.find('img, a').each((_, el) => {
                    const $el = $$(el);
                    const attrs = ['src', 'href'];
                    for (const attr of attrs) {
                        const v = $el.attr(attr);
                        if (v && !v.startsWith('http')) {
                            try {
                                $el.attr(attr, new URL(v, item.link).href);
                            } catch {
                                // ignore malformed url
                            }
                        }
                    }
                });

                const content = $content.html() || '';
                // 提取作者/编辑等信息，并去除"发布时间"和日期
                const metaTexts = $$('.show01 p i')
                    .toArray()
                    .map((el) => $$(el).text().trim())
                    .filter(Boolean);

                // 过滤包含"发布时间"的项与日期字符串
                const authors = metaTexts.filter((t) => !t.includes('发布时间')).filter((t) => !datePattern.test(t));

                // 如果列表页没有解析到 pubDate，则尝试从 meta 文本中回填
                let pubDateRecovered: string | number | Date | undefined;
                if (!item.pubDate) {
                    const dateTextInMeta = metaTexts.find((t) => datePattern.test(t));
                    if (dateTextInMeta) {
                        const matched = dateTextInMeta.match(datePattern)?.[0];
                        if (matched) {
                            try {
                                pubDateRecovered = parseDate(matched);
                            } catch {
                                // ignore parse error
                            }
                        }
                    }
                }

                return {
                    ...item,
                    description: content,
                    author: authors.join(', '),
                    pubDate: item.pubDate || pubDateRecovered,
                };
            })
        )
    );

    return {
        title: `广外新传学院-${titleMap[category] ?? titleMap.news}`,
        link,
        description: '广东外语外贸大学新闻与传播学院官网-新闻中心',
        item: enhancedItems,
    };
};

export const route: Route = {
    path: '/xwxy/:category?',
    categories: ['university'],
    example: '/gdufs/xwxy/news',
    parameters: {
        category: {
            description: '分类，默认为 `news`',
            options: [
                { label: '学院新闻', value: 'news' },
                { label: '通知', value: 'notices' },
                { label: '公告', value: 'announcements' },
                { label: '媒体聚焦', value: 'media' },
            ],
        },
    },
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
            source: ['xwxy.gdufs.edu.cn/xwzx/xyxw', 'xwxy.gdufs.edu.cn/'],
            target: '/xwxy/news',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/tzgg/tz'],
            target: '/xwxy/notices',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/tzgg/gg'],
            target: '/xwxy/announcements',
        },
        {
            source: ['xwxy.gdufs.edu.cn/xwzx/mtjj'],
            target: '/xwxy/media',
        },
    ],
    name: '新闻学院-新闻中心',
    maintainers: ['gz4zzxc'],
    handler,
    url: 'xwxy.gdufs.edu.cn',
};
