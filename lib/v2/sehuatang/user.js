// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

const baseUrl = 'https://sehuatang.org/';

module.exports = async (ctx) => {
    if (!config.sehuatang.cookie) {
        throw 'Sehuatang RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    // 从Url参数中获取uid
    const uid = ctx.params.uid;
    const link = `${baseUrl}home.php?mod=space&uid=${uid}&do=thread&view=me&from=space`;

    const response = await got(link, {
        headers: {
            Cookie: config.sehuatang.cookie,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('#delform tr:not(.th)')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
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
            ctx.cache.tryGet(info.link, async () => {
                const response = await got(info.link, {
                    headers: {
                        Cookie: config.sehuatang.cookie,
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    },
                });

                const $ = cheerio.load(response.data);
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
                    const enclosureUrl = isMag ? magnet : new URL(torrent, baseUrl).href;
                    info.enclosure_url = enclosureUrl;
                    info.enclosure_type = isMag ? 'application/x-bittorrent' : 'application/octet-stream';
                }

                return info;
            })
        )
    );

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: `${$('.mt').text()}的帖子-色花堂`,
        link,
        item: out,
    };
};
