import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://south-plus.net';

async function handler(ctx) {
    const fid = ctx.req.param('fid') ?? '8';
    const cookie = config.southplus.cookie;
    const ua = config.southplus.ua;

    const forumUrl = `${BASE_URL}/thread.php?fid-${fid}.html`;

    const headers: Record<string, string> = {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Referer: 'https://south-plus.net/index.php',
    };
    if (ua) {
        headers['User-Agent'] = ua;
    }
    if (cookie) {
        headers.Cookie = cookie;
    }

    const html = await ofetch(forumUrl, { headers });
    const $ = load(html);

    // Check if access is denied
    const pageTitle = $('head > title').text();
    if (pageTitle.includes('没有权限') || pageTitle.includes('没有登录') || pageTitle.includes('认证版块')) {
        if (!cookie) {
            throw new ConfigNotFoundError('此版块需要登录才能访问。请配置 SOUTHPLUS_COOKIE 环境变量。');
        }
        throw new ConfigNotFoundError('Cookie 已过期或无效，无法访问此版块。请更新 SOUTHPLUS_COOKIE 环境变量。');
    }

    // Parse thread list
    // Thread rows have class="tr3 t_one"
    // Structure: 5 td columns
    //   [0] status icon
    //   [1] category + title (h3 > a#a_ajax_XXXX) + page links
    //   [2] author (a.bl) + post date (div.f10.gray2)
    //   [3] replies/views
    //   [4] last post date (a.f10) + last poster (span.gray2)
    const threadList = $('tr.tr3.t_one a[id^="a_ajax_"]')
        .toArray()
        .map((item) => {
            const $el = $(item);
            const $row = $el.closest('tr');
            const threadLink = $el.attr('href');
            const title = $el.text().trim();
            const link = threadLink ? new URL(threadLink, BASE_URL).href : '';

            // Author in column 2
            const author = $row.find('a.bl[href*="action-show-uid"]').text().trim();

            // Thread post date in column 2 (div.f10.gray2)
            const postDateText = $row.find('div.f10.gray2').first().text().trim();

            // Last post date in column 4 (a.f10)
            const lastPostDateText = $row.find('td.tal.y-style a.f10').last().text().trim();

            // Use last post date as pubDate for RSS sorting
            const pubDate = parseDate(lastPostDateText) || parseDate(postDateText);

            // Thread category tag (e.g. [自购], [公告]) in column 1
            const category = $row.find('a.s8').first().text().trim();

            return {
                title,
                link,
                author,
                pubDate,
                category: category ? [category] : undefined,
            };
        });

    // Optionally fetch full content for each thread (with cache)
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;
    const items = await pMap(
        threadList.slice(0, limit),
        (item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailHtml = await ofetch(item.link, { headers });
                    const $detail = load(detailHtml);

                    // Get the main post content
                    // PHPWind: <div class="f14" id="read_tpc"> for the first post
                    const contentEl = $detail('#read_tpc');
                    if (contentEl.length > 0) {
                        item.description = contentEl.html() ?? '';

                        // Get the original post date from tiptop area
                        const dateEl = $detail('.tiptop .fl.gray');
                        if (dateEl.length > 0) {
                            const dateText = dateEl.first().text().trim();
                            const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
                            if (dateMatch) {
                                item.pubDate = parseDate(dateMatch[1]);
                            }
                        }

                        // Get the author from the detail page
                        const authorEl = $detail('.r_two a[href*="action-show-uid"] strong');
                        if (authorEl.length > 0) {
                            item.author = authorEl.first().text().trim();
                        }
                    }
                } catch {
                    // If detail page fails, keep the list page data
                }

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head > title').text().trim(),
        link: forumUrl,
        description: $('meta[name="description"]').attr('content'),
        language: 'zh-CN',
        item: items,
    };
}

export const route: Route = {
    path: '/forum/:fid?',
    categories: ['bbs'],
    example: '/south-plus/forum/8',
    parameters: {
        fid: '论坛版块 ID，默认为 8（ACG交流）。可在 thread.php?fid-XXX.html 中找到。常用 fid 见下方说明',
    },
    description: `::: tip 常用版块 ID

| fid | 版块名称 | 需要登录 |
| --- | -------- | :------: |
| 48  | 询问求物 |    是    |
| 8   | ACG 交流 |    否    |
| 12  | 轻小说   |    是    |
| 9   | 茶馆     |    是    |
| 201 | COSPLAY  |    是    |
| 6   | 游戏资源 |    是    |
| 5   | 实用漫画 |    是    |
| 4   | 实用动画 |    是    |
| 128 | 同人音声 |    是    |
| 208 | AI 交流  |    是    |

:::

::: tip Cookie 示例

\`\`\`
eb9e6_winduser=XXXX...XXXX%3D%3D; eb9e6_cknum=YYYY...YYYY%3D; eb9e6_ck_info=%2F%09; cf_clearance=ZZZZ...ZZZZ; eb9e6_lastpos=other; eb9e6_ol_offset=123456; eb9e6_readlog=%2C...; eb9e6_threadlog=%2C...; eb9e6_lastvisit=...; peacemaker=1
\`\`\`

\`eb9e6_winduser\` 和 \`eb9e6_cknum\` 是必需的认证 cookie，其余可选。
:::

::: tip UA 说明
South Plus 服务器会校验 Cookie 与浏览器 User-Agent 的绑定关系。Cookie 仅在登录时使用的浏览器版本下有效，不同版本或不同平台的 UA 均会被拒绝。

如需更换 Cookie，请同时设置 \`SOUTHPLUS_UA\` 为对应浏览器的 UA 字符串。未设置时 RSSHub 会自动生成随机的浏览器 UA。

如果 Cookie 是通过代理获取的，需设置 RSSHub 全局环境变量 \`PROXY_URI\`（如 \`http://host:port\`），否则服务器会拒绝认证。
:::
:::`,
    features: {
        requireConfig: [
            {
                name: 'SOUTHPLUS_COOKIE',
                optional: true,
                description: '登录 Cookie，格式为分号+空格分隔的 key=value 对。核心字段：eb9e6_winduser（认证令牌）、eb9e6_cknum（会话校验）。从浏览器登录后导出完整 cookie 字符串即可。',
            },
            {
                name: 'SOUTHPLUS_UA',
                optional: true,
                description: '浏览器 User-Agent，需与获取 Cookie 时使用的浏览器版本完全一致。可从浏览器 F12 → Network → 请求头中复制。未设置时由 RSSHub 自动生成随机浏览器 UA。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['south-plus.net/thread.php', 'snow-plus.net/thread.php'],
            target: '/forum/:fid',
        },
    ],
    name: '论坛帖子',
    maintainers: ['NicholasYZ'],
    handler,
};
