import { Route } from '@/types';
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const baseUrl = 'https://sehuatang.org/';

export const route: Route = {
    path: '/user/:uid',
    categories: ['multimedia'],
    example: '/sehuatang/user/411096',
    parameters: { uid: '用户 uid, 可在用户主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'SEHUATANG_COOKIE',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '作者文章',
    maintainers: ['JamYiz'],
    handler,
};

async function handler(ctx) {
    if (!config.sehuatang.cookie) {
        throw new ConfigNotFoundError('Sehuatang RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    // 从Url参数中获取uid
    const uid = ctx.req.param('uid');
    const link = `${baseUrl}home.php?mod=space&uid=${uid}&do=thread&view=me&from=space`;

    const response = await got(link, {
        headers: {
            Cookie: config.sehuatang.cookie,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const $ = load(response.data);

    const list = $('#delform tr:not(.th)')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('th>a').first();
            const category = item.find('.xg1').first().text();
            return {
                title: `[${category}] ${a.text()}`,
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: baseUrl + a.attr('href'),
                // pubDate: '',
                author: $('.mt').first().text(),
            };
        });

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await got(info.link, {
                    headers: {
                        Cookie: config.sehuatang.cookie,
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    },
                });

                const $ = load(response.data);
                const postMessage = $("[id^='postmessage']").slice(0, 1);
                const images = $(postMessage).find('img');
                for (const image of images) {
                    const file = $(image).attr('file');
                    if (!file || file === 'undefined') {
                        $(image).replaceWith('');
                    } else {
                        $(image).replaceWith($(`<img src="${file}">`));
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

                const dateString = $('.authi em').first().text();
                const datestampString = dateString.split(' ')[1];
                const timestampString = dateString.split(' ')[2];
                const datetimeString = `${datestampString} ${timestampString}`;
                const timestamp = new Date(datetimeString).getTime();

                info.pubDate = $('.authi em span').length > 0 ? parseDate($('.authi em span').attr('title')) : parseDate(timestamp);

                const magnet = postMessage.find('div.blockcode li').first().text();
                const isMag = magnet.startsWith('magnet');
                const torrent = postMessage.find('p.attnm a').attr('href');

                const hasEnclosureUrl = isMag || torrent !== undefined;
                if (hasEnclosureUrl) {
                    const enclosureUrl = isMag ? magnet : new URL(torrent, baseUrl).href;
                    info.enclosure_url = enclosureUrl;
                    info.enclosure_type = isMag ? 'application/x-bittorrent' : 'application/octet-stream';
                }

                return info;
            })
        )
    );

    return {
        // 在此处输出您的 RSS
        title: `${$('.mt').text()}的帖子-色花堂`,
        link,
        item: out,
    };
}
