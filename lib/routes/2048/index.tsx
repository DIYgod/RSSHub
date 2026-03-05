import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    categories: ['multimedia'],
    example: '/2048/2',
    parameters: { id: '板块 ID, 见下表，默认为最新合集，即 `3`，亦可在 URL 中找到, 例如, `thread.php?fid-3.html`中, 板块 ID 为`3`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '论坛',
    maintainers: ['nczitzk'],
    handler,
    description: `| 最新合集 | 亞洲無碼 | 日本騎兵 | 歐美新片 | 國內原創 | 中字原創 | 三級寫真 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 3        | 4        | 5        | 13       | 15       | 16       | 18       |

| 有碼.HD | 亞洲 SM.HD | 日韓 VR/3D | 歐美 VR/3D | S-cute / Mywife / G-area |
| ------- | ---------- | ---------- | ---------- | ------------------------ |
| 116     | 114        | 96         | 97         | 119                      |

| 網友自拍 | 亞洲激情 | 歐美激情 | 露出偷窺 | 高跟絲襪 | 卡通漫畫 | 原創达人 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 23       | 24       | 25       | 26       | 27       | 28       | 135      |

| 唯美清純 | 网络正妹 | 亞洲正妹 | 素人正妹 | COSPLAY | 女优情报 | Gif 动图 |
| -------- | -------- | -------- | -------- | ------- | -------- | -------- |
| 21       | 274      | 276      | 277      | 278     | 29       |          |

| 獨家拍攝 | 稀有首發 | 网络见闻 | 主播實錄 | 珍稀套圖 | 名站同步 | 实用漫画 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 213      | 94       | 283      | 111      | 88       | 131      | 180      |

| 网盘二区 | 网盘三区 | 分享福利 | 国产精选 | 高清福利 | 高清首发 | 多挂原创 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 72       | 272      | 195      | 280      | 79       | 216      | 76       |

| 磁链迅雷 | 正片大片 | H-GAME | 有声小说 | 在线视频 | 在线快播影院 |
| -------- | -------- | ------ | -------- | -------- | ------------ |
| 43       | 67       | 66     | 55       | 78       | 279          |

| 综合小说 | 人妻意淫 | 乱伦迷情 | 长篇连载 | 文学作者 | TXT 小说打包 |
| -------- | -------- | -------- | -------- | -------- | ------------ |
| 48       | 103      | 50       | 54       | 100      | 109          |

| 聚友客栈 | 坛友自售 |
| -------- | -------- |
| 57       | 136      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '3';

    const rootUrl = 'https://hjd2048.com';
    // 获取地址发布页指向的 URL
    const domainInfo = await cache.tryGet('2048:domainInfo', async () => {
        const response = await ofetch('https://2048.info');
        const $ = load(response);
        const onclickValue = $('.button').first().attr('onclick');
        const targetUrl = onclickValue?.match(/window\.open\('([^']+)'/)?.[1];

        return { url: new URL(targetUrl, 'https://2048.info').href };
    });
    // 获取重定向后的url
    const redirectResponse = await ofetch.raw(domainInfo.url);
    const redirected = await cache.tryGet(
        `2048:redirected:${new URL(redirectResponse.url).host}`,
        async () => {
            const captchaPage = await ofetch(redirectResponse.url);
            const $captcha = load(captchaPage);
            // Extract the value of safeid from the $captcha HTML content
            const safeidMatch = $captcha.html()?.match(/var\s+safeid\s*=\s*'([^']+)'/);
            const safeid = safeidMatch ? safeidMatch[1] : undefined;
            return {
                url: redirectResponse.url,
                safeid,
            };
        },
        86400, // fixed cookie duration: 24 hours
        false
    );
    const currentUrl = `${redirected.url}thread.php?fid-${id}.html`;

    const response = await ofetch.raw(currentUrl, {
        headers: {
            cookie: `_safe=${redirected.safeid}`,
        },
    });

    const $ = load(response._data);
    const currentHost = `https://${new URL(response.url).host}`; // redirected host

    $('#shortcut').remove();
    $('tr[onmouseover="this.className=\'tr3 t_two\'"]').remove();

    const list = $('#ajaxtable tbody .tr2')
        .last()
        .nextAll('.tr3')
        .toArray()
        .map((item) => {
            item = $(item).find('a.subject');

            return {
                title: item.text(),
                link: `${currentHost}/${item.attr('href')}`,
                guid: `${rootUrl}/2048/${item.attr('href')}`,
            };
        })
        .filter((item) => !item.link.includes('undefined'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await ofetch(item.link, {
                    headers: {
                        cookie: `_safe=${redirected.safeid}`,
                    },
                });

                const content = load(detailResponse);

                content('.ads, .tips').remove();

                content('ignore_js_op').each(function () {
                    const img = content(this).find('img');
                    const originalSrc = img.attr('data-original');
                    const fallbackSrc = img.attr('src');
                    // 判断是否有 data-original 属性，若有则使用其值，否则使用 src 属性值
                    const imgSrc = originalSrc || fallbackSrc;
                    content(this).replaceWith(`<img src="${imgSrc}">`);
                });

                item.author = content('.fl.black').first().text();
                item.pubDate = timezone(parseDate(content('span.fl.gray').first().attr('title')), +8);

                const readTpc = content('#read_tpc').first();
                const copyLink = content('#copytext')?.first()?.text();
                const readTpcHtml = readTpc.html() ?? '';

                // Extract enclosure: rmdown.com (fetch page for magnet) | magnet from 哈希校验 | copyLink
                const rmdownLink = readTpc.find('a[href*="rmdown.com/link.php"]').first().attr('href');
                const enclosureHref = rmdownLink?.startsWith('http') ? rmdownLink : rmdownLink ? `https://www.rmdown.com/${rmdownLink}` : null;

                if (enclosureHref) {
                    const rmdownPage = await cache.tryGet(`2048:rmdown:${enclosureHref}`, () => ofetch(enclosureHref));
                    const btihMatch = rmdownPage.match(/Code:\s*([a-fA-F0-9]{40})/);
                    const magnetUrl = btihMatch ? `magnet:?xt=urn:btih:${btihMatch[1]}` : null;
                    if (magnetUrl) {
                        item.enclosure_url = magnetUrl;
                        item.enclosure_type = 'x-scheme-handler/magnet';
                    }
                }
                if (!item.enclosure_url) {
                    const hashMatch = readTpcHtml.match(/哈希校验[^;]*;\s*([a-fA-F0-9]{40})\s*[;；]/);
                    const magnetFromHash = hashMatch ? `magnet:?xt=urn:btih:${hashMatch[1]}` : null;
                    const magnetLink = readTpcHtml.match(/magnet:\?xt=urn:btih:[^\s"'<>]+/)?.[0] ?? magnetFromHash ?? copyLink;
                    if (magnetLink?.startsWith('magnet')) {
                        item.enclosure_url = magnetLink;
                        item.enclosure_type = 'x-scheme-handler/magnet';
                    }
                }

                const desp = content('#read_tpc').first();

                content('.showhide img').each(function () {
                    desp.append(`<br><img style="max-width: 100%;" src="${content(this).attr('src')}">`);
                });

                item.description = desp.html();

                return item;
            })
        )
    );

    return {
        title: `${$('#main #breadCrumb a').last().text()} - 2048核基地`,
        link: currentUrl,
        item: items,
    };
}
