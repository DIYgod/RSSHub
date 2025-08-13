import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const ROOT_URL = 'https://zhibo.sina.com.cn';

export const route: Route = {
    path: ['/finance/zhibo/:zhibo_id?', '/zhibo/:zhibo_id?'],
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/sina/zhibo',
    parameters: {
        zhibo_id: '直播频道 id，默认为 152（财经）。常见：151 政经、153 综合、155 市场、164 国际、242 行业',
        limit: '返回条数，默认 20；接口单页最多 10 条，超过将自动分页抓取',
        pagesize: '单页条数（1-10），默认 10；超过仍按 10 处理',
        tag: '标签过滤，支持标签名或ID。如：市场、公司、A股、美股等，留空表示不过滤',
        dire: "方向，'f'（默认）或 'b'",
        dpc: '客户端标记，默认 1（与官网一致）',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '7×24直播',
    maintainers: ['nczitzk'],
    handler,
    url: 'zhibo.sina.com.cn',
    description:
        '对接新浪财经直播接口（zhibo）。\n\n' +
        '参数：\n' +
        '- `zhibo_id`: 频道 ID，默认 152（财经）。常见：151 政经、153 综合、155 市场、164 国际、242 行业\n' +
        '- `limit`: 返回条数，默认 20。接口单页最多 10 条，超过会自动分页抓取\n' +
        '- `pagesize`: 单页条数（1-10），默认 10\n' +
        '- `tag`: 标签过滤，支持标签名或ID。如：市场、公司、A股、美股等，留空表示不过滤\n' +
        "- `dire`: 方向，'f'（默认）或 'b'\n" +
        '- `dpc`: 客户端标记，默认 1\n\n' +
        '别名路径：`/sina/finance/zhibo/:zhibo_id?` 与 `/sina/zhibo/:zhibo_id?` 均可使用。',
};

interface ZhiboFeedItem {
    id: number;
    zhibo_id: number;
    rich_text: string;
    create_time: string; // 'YYYY-MM-DD HH:mm:ss'
    creator?: string;
    docurl?: string;
    multimedia?: string;
    tag?: Array<{
        id: string;
        name: string;
    }>;
    ext?: string; // JSON string containing docurl, docid, etc.
}

async function handler(ctx) {
    const zhiboId = ctx.req.param('zhibo_id') ?? '152';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const pagesizeQuery = ctx.req.query('pagesize');
    const tagFilter = ctx.req.query('tag'); // 用户输入的标签名或ID
    const dire = ctx.req.query('dire') ?? 'f';
    const dpc = ctx.req.query('dpc') ?? '1';

    const apiUrl = `${ROOT_URL}/api/zhibo/feed`;

    const pageSize = Math.min(10, Math.max(1, pagesizeQuery ? Number.parseInt(pagesizeQuery) : 10)); // 接口单页上限
    const maxPages = Math.max(1, Math.ceil(limit / pageSize));

    const collected: ZhiboFeedItem[] = [];
    const pageNumbers = Array.from({ length: maxPages }, (_, i) => i + 1);
    const pages = await Promise.all(
        pageNumbers.map((page) =>
            got(apiUrl, {
                searchParams: {
                    zhibo_id: zhiboId,
                    pagesize: pageSize,
                    tag: '0', // 不在API层面过滤，获取全部数据
                    dire,
                    dpc,
                    page,
                },
            }).then((res) => ({ page, list: (res.data?.result?.data?.feed?.list as ZhiboFeedItem[]) ?? [] }))
        )
    );
    pages.sort((a, b) => a.page - b.page);
    for (const p of pages) {
        if (collected.length >= limit * 2) {
            // 多获取一些数据以便过滤
            break;
        }
        if (p.list.length) {
            collected.push(...p.list);
        }
    }

    // 客户端过滤标签
    let filteredData = collected;
    if (tagFilter) {
        filteredData = collected.filter((item) => {
            if (!item.tag || item.tag.length === 0) {
                return false;
            }
            return item.tag.some((tag) => tag.name === tagFilter || tag.id === tagFilter || tag.name.includes(tagFilter));
        });
    }

    filteredData = filteredData.slice(0, limit);

    const items = await Promise.all(
        filteredData.map(async (it) => {
            const plain = it.rich_text?.replace(/<[^>]+>/g, '').trim() ?? '';
            // 优先使用「【…】」内的文字作为标题，避免把正文混入标题
            const bracketMatch = plain.match(/^【([^】]+)】/);
            let titleText;
            if (bracketMatch) {
                titleText = `【${bracketMatch[1]}】`;
            } else if (plain.length > 0) {
                titleText = plain.length > 80 ? `${plain.slice(0, 80)}…` : plain;
            } else {
                titleText = `直播快讯 #${it.id}`;
            }
            // 标题保持纯文本，提高RSS阅读器兼容性（参考同花顺格式）
            const title = titleText;

            // 解析ext字段获取完整信息
            let detailLink = 'https://finance.sina.com.cn/7x24/';
            let stockInfo: Array<{ market: string; symbol: string; key: string }> = [];

            if (it.ext) {
                try {
                    const extData = JSON.parse(it.ext);
                    if (extData.docurl) {
                        detailLink = extData.docurl.replace(/^http:\/\//, 'https://');
                    }
                    if (extData.stocks && Array.isArray(extData.stocks)) {
                        stockInfo = extData.stocks;
                    }
                } catch {
                    // 解析失败时使用默认链接
                }
            }

            // 如果没有ext中的docurl，使用直接的docurl字段
            if (detailLink === 'https://finance.sina.com.cn/7x24/' && it.docurl) {
                detailLink = it.docurl.replace(/^http:\/\//, 'https://');
            }

            // 提取图片和多媒体内容
            const images: string[] = [];
            if (it.multimedia && typeof it.multimedia === 'string') {
                // 解析multimedia字段中的图片
                const imgMatches = it.multimedia.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
                if (imgMatches) {
                    for (const imgTag of imgMatches) {
                        const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
                        if (srcMatch) {
                            images.push(srcMatch[1]);
                        }
                    }
                }
            }

            // 从rich_text中提取图片
            if (it.rich_text && typeof it.rich_text === 'string') {
                const richTextImgMatches = it.rich_text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
                if (richTextImgMatches) {
                    for (const imgTag of richTextImgMatches) {
                        const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
                        if (srcMatch && !images.includes(srcMatch[1])) {
                            images.push(srcMatch[1]);
                        }
                    }
                }
            }

            // 若目前仍无图片，兜底抓取详情页图片（参考同花顺做法）
            if (images.length === 0 && detailLink) {
                try {
                    const detailResp = await got(detailLink);
                    const $ = load(detailResp.data);
                    const ogImage = $('meta[property="og:image"]').attr('content');
                    const twitterImage = $('meta[name="twitter:image"], meta[name="twitter:image:src"]').attr('content');
                    const pageImages = new Set<string>();
                    if (ogImage) {
                        pageImages.add(ogImage);
                    }
                    if (twitterImage) {
                        pageImages.add(twitterImage);
                    }
                    $('#article img[src], #artibody img[src]').each((_, el) => {
                        const src = $(el).attr('src');
                        if (src) {
                            pageImages.add(src);
                        }
                    });
                    images.push(...pageImages);
                } catch {
                    // 详情页不可达时忽略
                }
            }

            // 生成完整描述（不限制字符长度）
            const description = `${plain}<br>`;

            // 生成完整HTML内容
            const contentHtml = `${it.rich_text || ''}<br>${images.map((img) => `<img src="${img}" referrerpolicy="no-referrer" />`).join('<br>')}<br>`;

            // 构建分类信息：标签 + 股票关键词
            const categories = [...(it.tag?.map((t) => t.name) || []), ...stockInfo.map((s) => s.key)];
            const uniqueCategories = [...new Set(categories)].filter(Boolean);

            return {
                title,
                link: detailLink,
                description,
                author: it.creator?.replace('@staff.sina.com', '') ?? '新浪财经',
                pubDate: parseDate(it.create_time),
                guid: `sina-finance-zhibo-${it.id}`,
                category: uniqueCategories,
                image: images[0], // 主图片
                banner: images[0], // 横幅图片（与主图相同）
                content: {
                    html: contentHtml,
                    text: plain,
                },
            };
        })
    );

    // 图片和多媒体内容已在上面通过模板处理，无需额外处理

    const CHANNELS: Record<string, string> = {
        '151': '政经',
        '152': '财经',
        '153': '综合',
        '155': '市场',
        '164': '国际',
        '242': '行业',
    };

    const channelTitle = CHANNELS[zhiboId] || '财经';
    const tagSuffix = tagFilter ? ` - ${tagFilter}` : '';

    return {
        title: `新浪财经 - 7×24直播 - ${channelTitle}${tagSuffix}`,
        link: 'https://finance.sina.com.cn/7x24/',
        description: `新浪财经7×24小时财经直播 - ${channelTitle}频道${tagSuffix}`,
        item: items,
        author: '新浪财经',
        image: 'https://finance.sina.com.cn/favicon.ico',
    };
}
