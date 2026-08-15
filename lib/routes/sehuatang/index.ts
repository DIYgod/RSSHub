import { load } from 'cheerio';
import type { BrowserContext } from 'patchright';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { addCookies, getContext, playwrightGet } from './utils';

const forumIdMaps = {
    // 原创 BT 电影
    gcyc: '2', //     国产原创
    yzwmyc: '36', //  亚洲无码原创
    yzymyc: '37', //  亚洲有码原创
    gqzwzm: '103', // 高清中文字幕
    sjxz: '107', //   三级写真
    vr: '160', //     VR 视频
    srym: '104', //   素人有码
    omwm: '38', //    欧美无码
    '4k': '151', //   4K 原版
    hgzb: '152', //   韩国主播
    dmyc: '39', //    动漫原创
    // 色花图片
    yczp: '155', //   原创自拍
    ztzp: '125', //   转贴自拍
    hrjp: '50', //    华人街拍
    yzxa: '48', //    亚洲性爱
    omxa: '49', //    欧美性爱
    ktdm: '117', //   卡通动漫
    ttxz: '165', //   套图下载

    zhtl: '95', //    综合讨论
    // no longer updated/available
    mrhj: '106', //   每日合集
    ai: '113', //     AI 换脸电影
    ydsc: '111', //   原档收藏 WMV
    hrxazp: '98', //  华人性爱自拍
};

export const route: Route = {
    path: ['/bt/:subforumid?', '/picture/:subforumid', '/:subforumid?/:type?', '/:subforumid?', ''],
    categories: ['multimedia'],
    example: '/sehuatang/36/368',
    parameters: {
        subforumid: '版块 id 或板块名称（见下表）, 为空默认高清中文字幕',
        type: '类型 id, 可在分区类型过滤后的 URL 中找到',
    },
    name: 'Forum',
    maintainers: ['qiwihui', 'junfengP', 'nczitzk'],
    handler,
    features: {
        requirePuppeteer: true,
        nsfw: true,
    },
    description: `**原创 BT 电影**

| 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | VR 视频 | 素人有码 | 欧美无码 | 韩国主播 | 动漫原创 | 综合讨论 |
| -------- | ------------ | ------------ | ------------ | -------- | ------- | -------- | -------- | -------- | -------- | -------- |
| gcyc     | yzwmyc       | yzymyc       | gqzwzm       | sjxz     | vr      | srym     | omwm     | hgzb     | dmyc     | zhtl     |

**色花图片**

| 原创自拍 | 转贴自拍 | 华人街拍 | 亚洲性爱 | 欧美性爱 | 卡通动漫 | 套图下载 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| yczp     | ztzp     | hrjp     | yzxa     | omxa     | ktdm     | ttxz     |`,
};

const getSafeId = (host: string, context: BrowserContext) =>
    cache.tryGet(
        `sehuatang:safeid:${host}`,
        async () => {
            logger.debug(`[sehuatang] getSafeId start, host=${host}`);
            const page = await context.newPage();
            try {
                await page.route('**/*', (route) => {
                    const request = route.request();
                    ['document', 'script'].includes(request.resourceType()) ? route.continue() : route.abort();
                });
                logger.debug(`[sehuatang] getSafeId goto ${host}`);
                await page.goto(host, { waitUntil: 'domcontentloaded' });
                logger.debug(`[sehuatang] getSafeId goto done, title=${await page.title()}, url=${page.url()}`);
                // Wait for the safeid script to appear (gives Cloudflare challenge time to pass).
                try {
                    logger.debug('[sehuatang] getSafeId waiting for safeid script...');
                    await page.waitForFunction(
                        () => {
                            const scripts = document.querySelectorAll('script');
                            for (const script of scripts) {
                                if (script.textContent?.includes('safeid')) {
                                    return true;
                                }
                            }
                            return false;
                        },
                        { timeout: 30000 }
                    );
                    logger.debug('[sehuatang] getSafeId safeid script found');
                } catch {
                    logger.debug('[sehuatang] getSafeId waitForFunction timeout');
                }
                const safeId = await page.evaluate(() => {
                    const scripts = document.querySelectorAll('script');
                    for (const script of scripts) {
                        const match = script.textContent?.match(/safeid\s*=\s*'(.+)';/);
                        if (match) {
                            return match[1];
                        }
                    }
                    return '';
                });
                logger.debug(`[sehuatang] getSafeId result=${JSON.stringify(safeId)}`);
                return safeId;
            } finally {
                await page.close();
            }
        },
        config.cache.routeExpire,
        false
    );

async function handler(ctx) {
    const domain = ctx.req.query('domain') ?? 'www.sehuatang.net';
    const host = `https://${domain}/`;
    const { subforumName = '103', type } = ctx.req.param();
    const subforumId = Object.hasOwn(forumIdMaps, subforumName) ? forumIdMaps[subforumName] : subforumName;
    const typeFilter = type ? `&filter=typeid&typeid=${type}` : '';
    const link = `${host}forum.php?mod=forumdisplay&orderby=dateline&fid=${subforumId}${typeFilter}`;

    const { context, destroy } = await getContext(host);
    try {
        logger.debug(`[sehuatang] handler start, domain=${domain}, host=${host}, link=${link}`);
        const safeId = await getSafeId(host, context);
        logger.debug(`[sehuatang] handler safeId=${JSON.stringify(safeId)}`);

        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0';
        // Let the browser manage cookies (including Cloudflare challenge cookies) via the shared context.
        if (safeId) {
            await addCookies(context, `_safe=${safeId}`, new URL(host).host);
        }
        const headers: Record<string, string> = {
            'User-Agent': userAgent,
            Cookie: safeId ? `_safe=${safeId};` : '',
        };

        const response = await playwrightGet(headers, link, context, '#threadlisttableid tbody[id^=normalthread]');
        const $ = load(response);
        logger.debug(`[sehuatang] handler list page fetched, html length=${response.length}, hasThreadTable=${$('#threadlisttableid').length > 0}, cf-chl=${response.includes('cf-chl') || response.includes('challenge-platform')}`);

        const list = $('#threadlisttableid tbody[id^=normalthread]')
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
            .toArray()
            .map((item): DataItem => {
                const $item = $(item);
                const hasCategory = $item.find('th em a').length;
                return {
                    title: `${hasCategory ? `[${$item.find('th em a').text()}]` : ''} ${$item.find('a.xst').text()}`,
                    link: host + $item.find('a.xst').attr('href'),
                    pubDate: parseDate($item.find('td.by').find('em span span').attr('title')!),
                    author: $item.find('td.by cite a').first().text(),
                };
            });
        logger.debug(`[sehuatang] handler list parsed, count=${list.length}`);

        const out = await Promise.all(
            list.map((info) =>
                cache.tryGet(info.link!, async () => {
                    const response = await playwrightGet(headers, info.link!, context, 'div[id^="postmessage"], td[id^="postmessage"]');
                    logger.debug(`[sehuatang] detail fetched, link=${info.link}, length=${response.length}, cf-chl=${response.includes('cf-chl') || response.includes('challenge-platform')}`);

                    const $ = load(response);
                    const postMessage = $('div[id^="postmessage"], td[id^="postmessage"]').slice(0, 1);
                    const images = $(postMessage).find('img');
                    for (const image of images) {
                        const file = $(image).attr('file');
                        if (!file || file === 'undefined') {
                            $(image).replaceWith('');
                        } else {
                            const imageURL = file;
                            $(image).replaceWith($(`<img src="${imageURL}">`));
                        }
                    }
                    // also parse image url from `.pattl`
                    const pattl = $('.pattl');
                    const pattlImages = $(pattl).find('img');
                    for (const pattlImage of pattlImages) {
                        const file = $(pattlImage).attr('file');
                        if (!file || file === 'undefined') {
                            $(pattlImage).replaceWith('');
                        } else {
                            $(pattlImage).replaceWith($(`<img src="${file}" />`));
                        }
                    }
                    postMessage.append($(pattl));
                    $('em[onclick]').remove();

                    info.description = (postMessage.html() || '抓取原帖失败').replaceAll('ignore_js_op', 'div');
                    info.pubDate = timezone(parseDate($('.authi em span').attr('title')!), 8);

                    const magnet = postMessage.find('div.blockcode li').first().text();
                    const isMag = magnet.startsWith('magnet');
                    const torrent = postMessage.find('p.attnm a').attr('href') || '';

                    const hasEnclosureUrl = isMag || torrent !== '';
                    if (hasEnclosureUrl) {
                        const enclosureUrl = isMag ? magnet : new URL(torrent!, host).href;
                        info.enclosure_url = enclosureUrl;
                        info.enclosure_type = isMag ? 'application/x-bittorrent' : 'application/octet-stream';
                    }

                    return info;
                })
            )
        );

        return {
            title: `色花堂 - ${$('#pt > div:nth-child(1) > a:last-child').text()}`,
            link,
            item: out,
        };
    } finally {
        await destroy();
    }
}
