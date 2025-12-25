import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { puppeteerGet } from './utils';

const allowDomain = new Set(['www.sehuatang.net', 'www.sehuatang.org']);

const imageProxyList = ['https://cdn.cdnjson.com/pic.html?url=', 'https://image.baidu.com/search/down?url='];

export const route: Route = {
    path: ['/bt/:subforumid?', '/picture/:subforumid', '/:subforumid?/:type?', '/:subforumid?', ''],
    example: '/sehuatang/103',
    parameters: {
        subforumid: {
            description: '板块 ID ',
            options: [
                { value: 'forum_01', label: '== 原创 BT 电影 ==' },
                { value: '2', label: '国产原创' },
                { value: '36', label: '亚洲无码原创' },
                { value: '37', label: '亚洲有码原创' },
                { value: '103', label: '高清中文字幕' },
                { value: '107', label: '三级写真' },
                { value: '160', label: 'VR 视频' },
                { value: '104', label: '素人有码' },
                { value: '38', label: '欧美无码' },
                { value: '152', label: '韩国主播' },
                { value: '39', label: '动漫原创' },
                { value: '95', label: '综合讨论' },
                { value: 'forum_02', label: '== 色花图片 ==' },
                { value: '155', label: '原创自拍' },
                { value: '125', label: '转贴自拍' },
                { value: '50', label: '华人街拍' },
                { value: '48', label: '亚洲性爱' },
                { value: '49', label: '欧美性爱' },
                { value: '117', label: '卡通动漫' },
                { value: '165', label: '套图下载' },
            ],
        },
        type: {
            description: '分类 ID, 可选,  板块内子分类 请参考论坛',
        },
    },
    name: 'Forum',
    maintainers: ['qiwihui', 'junfengP', 'nczitzk'],
    handler,
    features: {
        nsfw: true,
    },
    description: `**原创 BT 电影**

| 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | VR 视频 | 素人有码 | 欧美无码 | 韩国主播 | 动漫原创 | 综合讨论 |
| -------- | ------------ | ------------ | ------------ | -------- | ------- | -------- | -------- | -------- | -------- | -------- |
| 2        | 36           | 37           | 103          | 107      | 160     | 104      | 38       | 152      | 39       | 95       |

  **色花图片**

| 原创自拍 | 转贴自拍 | 华人街拍 | 亚洲性爱 | 欧美性爱 | 卡通动漫 | 套图下载 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 155      | 125      | 50       | 48       | 49       | 117      | 165      |`,
};

const getSafeId = (headers, host) =>
    cache.tryGet(
        'sehuatang:safeid',
        async () => {
            const current = await puppeteerGet(headers, host);
            const $ = load(current.response);
            const safeId =
                $('script:contains("safeid")')
                    .text()
                    .match(/safeid\s*=\s*'(.+)';/)?.[1] || '';
            logger.debug(`safeId: ${safeId}`);
            return safeId;
        },
        config.cache.routeExpire,
        false
    );

async function handler(ctx) {
    const domain = ctx.req.query('domain') ?? 'www.sehuatang.net';
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(domain)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }
    const imageProxy = (ctx.req.query('imageProxy') ?? '-1').toString();
    const host = `https://${domain}/`;

    const { subforumid = '103', type } = ctx.req.param();
    const typefilter = type ? `&filter=typeid&typeid=${type}` : '';
    const link = `${host}forum.php?mod=forumdisplay&orderby=dateline&fid=${subforumid}${typefilter}`;

    const cookiesSafeId = `_safe=${await getSafeId(null, host)};`;

    const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
        Cookie: cookiesSafeId,
    };

    const current = await puppeteerGet(headers, link);
    headers.Cookie = current.cookiesStr + '; ' + cookiesSafeId;
    const $ = load(current.response);

    const list = $('#threadlisttableid tbody[id^=normalthread]')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const hasCategory = $item.find('th em a').length;
            return {
                title: `${hasCategory ? `[${$item.find('th em a').text()}]` : ''} ${$item.find('a.xst').text()}`,
                link: host + $item.find('a.xst').attr('href'),
                pubDate: parseDate($item.find('td.by').find('em span span').attr('title') || ''),
                author: $item.find('td.by cite a').first().text(),
                description: '',
                enclosure_url: '',
                enclosure_type: '',
            };
        });

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await puppeteerGet(headers, info.link).then((res) => res.response);

                const $ = load(response);
                const postMessage = $('div[id^="postmessage"], td[id^="postmessage"]').slice(0, 1);
                const images = $(postMessage).find('img');
                for (const image of images) {
                    const file = $(image).attr('file');
                    if (!file || file === 'undefined') {
                        $(image).replaceWith('');
                    } else {
                        let imageURL = file;
                        try {
                            new URL(imageProxy);
                            imageURL = `${imageProxy}${encodeURIComponent(file)}`;
                        } catch {
                            const proxyIndex = Number.parseInt(imageProxy, 10);
                            if (proxyIndex !== -1 && imageProxyList[proxyIndex]) {
                                imageURL = `${imageProxyList[proxyIndex]}${encodeURIComponent(file)}`;
                            }
                        }
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
                info.pubDate = timezone(parseDate($('.authi em span').attr('title') || ''), 8);

                const magnet = postMessage.find('div.blockcode li').first().text();
                const isMag = magnet.startsWith('magnet');
                const torrent = postMessage.find('p.attnm a').attr('href') || '';

                const hasEnclosureUrl = isMag || torrent !== '';
                if (hasEnclosureUrl) {
                    const enclosureUrl = isMag ? magnet : new URL(torrent, host).href;
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
}
