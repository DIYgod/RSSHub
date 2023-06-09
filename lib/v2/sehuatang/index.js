const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

const host = 'https://www.sehuatang.net/';

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

module.exports = async (ctx) => {
    const subformName = ctx.params.subforumid ?? 'gqzwzm';
    const subformId = subformName in forumIdMaps ? forumIdMaps[subformName] : subformName;
    const { type } = ctx.params;
    const typefilter = type ? `&filter=typeid&typeid=${type}` : '';
    const link = `${host}forum.php?mod=forumdisplay&orderby=dateline&fid=${subformId}${typefilter}`;
    const headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };
    await cookieJar.setCookie('_safe=vqd37pjm4p5uodq339yzk6b7jdt6oich', host);

    const response = await got(link, {
        cookieJar,
        headers,
    });
    const $ = cheerio.load(response.data);

    const list = $('#threadlisttableid tbody[id^=normalthread]')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);
            const hasCategory = item.find('th em a').length;
            return {
                title: `${hasCategory ? `[${item.find('th em a').text()}]` : ''} ${item.find('a.xst').text()}`,
                link: host + item.find('a.xst').attr('href'),
                pubDate: parseDate(item.find('td.by').find('em span span').attr('title')),
                author: item.find('td.by cite a').first().text(),
            };
        });

    const out = await Promise.all(
        list.map((info) =>
            ctx.cache.tryGet(info.link, async () => {
                const response = await got(info.link, {
                    cookieJar,
                    headers,
                });

                const $ = cheerio.load(response.data);
                const postMessage = $("td[id^='postmessage']").slice(0, 1);
                const images = $(postMessage).find('img');
                for (const image of images) {
                    const file = $(image).attr('file');
                    if (!file || file === 'undefined') {
                        $(image).replaceWith('');
                    } else {
                        $(image).replaceWith($(`<img src="${file}">`));
                    }
                }
                // if postMessage does not have any images, try to parse image url from `.pattl`
                if (images.length === 0) {
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
                }
                $('em[onclick]').remove();

                info.description = (postMessage.html() || '抓取原帖失败').replace(/ignore_js_op/g, 'div');
                info.pubDate = timezone(parseDate($('.authi em span').attr('title')), 8);

                const magnet = postMessage.find('div.blockcode li').first().text();
                const isMag = magnet.startsWith('magnet');
                const torrent = postMessage.find('p.attnm a').attr('href');

                const hasEnclosureUrl = isMag || torrent !== undefined;
                if (hasEnclosureUrl) {
                    const enclosureUrl = isMag ? magnet : new URL(torrent, host).href;
                    info.enclosure_url = enclosureUrl;
                    info.enclosure_type = isMag ? 'application/x-bittorrent' : 'application/octet-stream';
                }

                return info;
            })
        )
    );

    ctx.state.data = {
        title: `色花堂 - ${$('#pt > div:nth-child(1) > a:last-child').text()}`,
        link,
        item: out,
    };
};
