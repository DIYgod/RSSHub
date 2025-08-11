import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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
        tag: '标签过滤，0 表示不过滤（默认）。常见：3 公司、5 市场、7 央行、8 宏观、11 美股、12 A股（以实时返回为准）',
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
        '- `tag`: 标签过滤，0 表示不过滤（默认）。示例：3 公司、5 市场、7 央行、8 宏观、11 美股、12 A股（以实时返回为准）\n' +
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
}

async function handler(ctx) {
    const zhiboId = ctx.req.param('zhibo_id') ?? '152';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const pagesizeQuery = ctx.req.query('pagesize');
    const tag = ctx.req.query('tag') ?? '0';
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
                    tag,
                    dire,
                    dpc,
                    page,
                },
            }).then((res) => ({ page, list: (res.data?.result?.data?.feed?.list as ZhiboFeedItem[]) ?? [] }))
        )
    );
    pages.sort((a, b) => a.page - b.page);
    for (const p of pages) {
        if (collected.length >= limit) {
            break;
        }
        if (p.list.length) {
            const remain = limit - collected.length;
            collected.push(...p.list.slice(0, remain));
        }
    }

    const CHANNELS: Record<string, string> = {
        '151': '政经',
        '152': '财经',
        '153': '综合',
        '155': '市场',
        '164': '国际',
        '242': '行业',
    };

    let items = collected.slice(0, limit).map((it) => {
        const plain = it.rich_text?.replace(/<[^>]+>/g, '').trim() ?? '';
        // 优先使用「【…】」内的文字作为标题，避免把正文混入标题
        const bracketMatch = plain.match(/^【([^】]+)】/);
        const baseTitle = bracketMatch ? `【${bracketMatch[1]}】` : plain.length > 0 ? (plain.length > 80 ? `${plain.slice(0, 80)}…` : plain) : `直播快讯 #${it.id}`;

        // 样式检测：加粗、下划线、删除线（来自 rich_text 内联或标签）
        let hasBold = false;
        let hasUnderline = false;
        let hasStrike = false;
        try {
            const $rt = load(`<div id="rt">${it.rich_text ?? ''}</div>`);
            const container = $rt('#rt');
            hasBold =
                container.find('strong, b').length > 0 ||
                container
                    .find('span[style]')
                    .toArray()
                    .some((el) => /font-weight\s*:\s*(bold|[6-9]00)/i.test($rt(el).attr('style') || ''));
            hasUnderline =
                container.find('u').length > 0 ||
                container
                    .find('span[style]')
                    .toArray()
                    .some((el) => /text-decoration[^;]*:\s*underline/i.test($rt(el).attr('style') || ''));
            hasStrike =
                container.find('del, s').length > 0 ||
                container
                    .find('span[style]')
                    .toArray()
                    .some((el) => /line-through/i.test($rt(el).attr('style') || ''));
        } catch {
            // ignore
        }
        const styleLabels: string[] = [];
        if (hasBold) {
            styleLabels.push('粗体');
        }
        if (hasUnderline) {
            styleLabels.push('划线');
        }
        if (hasStrike) {
            styleLabels.push('删除线');
        }
        const title = styleLabels.length ? `${baseTitle}（${styleLabels.join('、')}）` : baseTitle;

        // 使用接口返回的 docurl 作为详情链接；缺失时退回频道页
        const link = it.docurl ? it.docurl.replace(/^http:\/\//, 'https://') : 'https://finance.sina.com.cn/7x24/';

        const bracketLabel = bracketMatch ? bracketMatch[1] : undefined;
        const categories: string[] = [];
        if (CHANNELS[zhiboId]) {
            categories.push(CHANNELS[zhiboId]);
        }
        if (bracketLabel) {
            categories.push(bracketLabel);
        }
        if (tag && tag !== '0') {
            categories.push(`tag:${tag}`);
        }

        // 正文：保留原始富文本，但需要去掉标题部分
        let processedRichText = it.rich_text ?? '';
        if (bracketMatch) {
            // 尝试从HTML中移除标题部分
            try {
                const $temp = load(`<div>${processedRichText}</div>`);
                const text = $temp.text();
                if (text.startsWith(`【${bracketMatch[1]}】`)) {
                    const titleLength = `【${bracketMatch[1]}】`.length;
                    const remainingText = text.slice(titleLength).trim();
                    if (remainingText) {
                        // 找到标题在HTML中的位置并移除
                        const titleRegex = new RegExp(`^.*?【${bracketMatch[1].replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)}】`, 'i');
                        processedRichText = processedRichText.replace(titleRegex, '').trim();
                    }
                }
            } catch {
                // fallback: 保持原始富文本
            }
        }

        const via = `via 新浪财经直播 - ${CHANNELS[zhiboId] ?? ''}${it.creator ? ` (author: ${it.creator})` : ''}`.trim();
        const description = `${processedRichText}${processedRichText ? '<br/><br/>' : ''}${via}`;

        return {
            title,
            link,
            description,
            author: it.creator,
            pubDate: parseDate(it.create_time),
            guid: `sina-finance-zhibo-${it.id}`,
            category: categories,
        };
    });

    // 先将富文本内的样式化 <span> 规范化为 <strong>/<u>/<del> 等基础标签，提升阅读器兼容性
    items = items.map((item) => {
        try {
            if (!item.description) {
                return item;
            }
            const $ = load(`<div id="rssroot">${item.description}</div>`);
            const container = $('#rssroot');
            container.find('span[style]').each((_, el) => {
                const node = $(el);
                const style = (node.attr('style') || '').toLowerCase();
                const needsBold = /font-weight\s*:\s*(bold|[6-9]00)/.test(style);
                const needsUnderline = /text-decoration[^;]*:\s*underline/.test(style);
                const needsStrike = /text-decoration[^;]*:\s*line-through/.test(style) || /text-decoration-line\s*:\s*line-through/.test(style);
                if (needsBold) {
                    node.wrapInner('<strong></strong>');
                }
                if (needsUnderline) {
                    node.wrapInner('<u></u>');
                }
                if (needsStrike) {
                    node.wrapInner('<del></del>');
                }
                node.removeAttr('style');
                // 去掉外层 span，只保留内部规范标签
                const html = node.html() ?? '';
                node.replaceWith(html);
            });
            item.description = container.html() ?? item.description;
        } catch {
            // ignore
        }
        return item;
    });

    // 取消无图时的详情页封面抓取与追加

    return {
        title: `新浪财经 - 7×24直播${CHANNELS[zhiboId] ? ` - ${CHANNELS[zhiboId]}` : ''}`,
        link: 'https://finance.sina.com.cn/7x24/',
        description: 'feedId:177629882355355648+userId:117254850907621376',
        image: 'https://finance.sina.com.cn/favicon.ico',
        item: items,
    };
}
