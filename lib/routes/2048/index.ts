import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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

    const domainInfo = (await cache.tryGet('2048:domainInfo', async () => {
        const response = await ofetch('https://hjd.tw', {
            headers: {
                accept: '*/*',
            },
        });
        let $ = load(response);
        const targetLink = new URL($('.address-list a').eq(0).attr('href'), 'https://hjd.tw').href;
        const redirectResponse = await ofetch.raw(targetLink);
        $ = load(redirectResponse._data);
        return {
            url: redirectResponse.url,
            cookie:
                $('script')
                    .text()
                    .match(/var safeid='(.*?)',/)?.[1] ?? '',
        };
    })) as { url: string; cookie: string };

    const currentUrl = `${domainInfo.url}thread.php?fid-${id}.html`;

    const response = await ofetch.raw(currentUrl, {
        headers: {
            cookie: `_safe=${domainInfo.cookie}`,
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
                        cookie: `_safe=${domainInfo.cookie}`,
                    },
                });

                const content = load(detailResponse);

                content('.ads, .tips').remove();

                content('ignore_js_op').each(function () {
                    content(this).replaceWith(`<img src="${content(this).find('img').attr('src')}">`);
                });

                item.author = content('.fl.black').first().text();
                item.pubDate = timezone(parseDate(content('span.fl.gray').first().attr('title')), +8);

                const downloadLink = content('#read_tpc').first().find('a').last();
                const copyLink = content('#copytext')?.first()?.text();
                if (downloadLink?.text()?.startsWith('http') && /bt\.azvmw\.com$/.test(new URL(downloadLink.text()).hostname)) {
                    const torrentResponse = await ofetch(downloadLink.text());

                    const torrent = load(torrentResponse);

                    item.enclosure_type = 'application/x-bittorrent';
                    const ahref = torrent('.uk-button').last().attr('href');
                    item.enclosure_url = ahref?.startsWith('http') ? ahref : `https://bt.azvmw.com/${ahref}`;

                    const magnet = torrent('.uk-button').first().attr('href');

                    downloadLink.replaceWith(
                        art(path.join(__dirname, 'templates/download.art'), {
                            magnet,
                            torrent: item.enclosure_url,
                        })
                    );
                } else if (copyLink?.startsWith('magnet')) {
                    // copy link
                    item.enclosure_url = copyLink;
                    item.enclosure_type = 'x-scheme-handler/magnet';
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
