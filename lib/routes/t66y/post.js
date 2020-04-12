const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');
const url = require('url');

const base = 'http://www.t66y.com';
const got_ins = got.extend({
    headers: {
        Referer: base,
    },
    responseType: 'buffer',
});

function killViidii(originUrl) {
    const decodeStr = /.*\?http/g;
    const decodeSig = /______/g;
    const jsSuffix = '&amp;z';
    const htmlSuffix = '&z';
    const returnSuffix = 'return false';
    if (originUrl.indexOf('viidii') !== -1) {
        return originUrl.replace(decodeStr, 'http').replace(decodeSig, '.').replace(jsSuffix, '').replace(htmlSuffix, '').replace(returnSuffix, '');
    } else {
        return originUrl;
    }
}

const sourceTimezoneOffset = -8;

function parseContent(htmlString) {
    let $ = cheerio.load(htmlString, { decodeEntities: false });
    let time = $('.tipad').text();
    const regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const regRes = regex.exec(time);
    time = regRes === null ? new Date() : new Date(regRes[0]);
    time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

    const author = $('th.r_two > b').text();
    const content = $('.tpc_content').html();

    // Change the image tag to display image in rss reader
    try {
        $ = cheerio.load(content, { decodeEntities: false }); // 修复无发进行filter与filterout的问题
    } catch (error) {
        return null;
    }

    // Handle video
    const video = $('a:nth-of-type(2)');
    if (video) {
        const videoScript = video.attr('onclick');
        const regVideo = /https?:\/\/.*'/;
        const videoRes = regVideo.exec(videoScript);
        if (videoRes && videoRes.length !== 0) {
            let link = videoRes[0];
            link = link.slice(0, link.length - 1);
            $('iframe').attr('src', link);
        }
    }
    // Handle img tag
    let images = $('img');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${$(images[k]).attr('data-src')}" />`);
    }
    // Handle input tag
    images = $('input');
    for (let k = 0; k < images.length; k++) {
        $(images[k]).replaceWith(`<img src="${$(images[k]).attr('data-src')}" />`);
    }

    // Handle links
    const links = $('a[href*="viidii"]');
    for (let k = 0; k < links.length; k++) {
        $(links[k]).attr('href', killViidii($(links[k]).attr('href')));
    }

    return {
        author: author,
        description: $('body').html(),
        pubDate: time.toUTCString(),
    };
}

module.exports = async (ctx) => {
    const tid = ctx.params.tid;
    let response = await got_ins.get(url.resolve(base, `/read.php?tid=${tid}`));
    let html = iconv.decode(response.data, 'gbk');
    // 跟踪重定向
    let $ = cheerio.load(html);
    const redirect = $('a:last-child').attr('href');
    response = await got_ins.get(url.resolve(base, redirect));
    html = iconv.decode(response.data, 'gbk');
    $ = cheerio.load(html, { decodeEntities: false });
    // 获取楼主id、末页
    const uid = /uid=(\d+)/.exec($('.t.t2').first().find('.tiptop>a:first-child').attr('href'))[1];
    const lasturl = $('.pages:first-child>a:last-child').attr('href');
    const lastpage = lasturl ? /page=(\d+)/.exec(lasturl)[1] : 1;
    // 从缓存中获取上次读取的页吗
    let page = 0;
    const cachePage = await ctx.cache.tryGet(`/t66y/post/${tid}`, () => ({ page }));
    page = cachePage.page + 1;
    if (page > lastpage) {
        page = lastpage;
    }

    // 记录重试次数
    let retry = 0;
    // 请求帖子
    const load = async (page) => {
        const link = url.resolve(base, `/read.php?tid=${tid}&page=${page}`);
        if (page > 1) {
            // 只有第二页开始需要重新读取
            html = await ctx.cache.tryGet(link, async () => {
                const response = await got_ins.get(link, {
                    headers: {
                        Referer: url.resolve(base, redirect),
                    },
                });
                return iconv.decode(response.data, 'gbk');
            });
            $ = cheerio.load(html, { decodeEntities: false });
        }

        const title = /本頁主題: (.+)\n?/.exec($('#main div.t .h:first-child').text())[1];
        const items = $('.t.t2')
            .get()
            .filter((item) => {
                const matchs = /uid=(\d+)/.exec($('.tiptop>a:first-child', item).attr('href'));
                return matchs.length === 2 && uid === matchs[1];
            })
            .map((item, index) => {
                const single = {
                    title: `P${page}#${index + 1} ${title}`,
                    link: `${link}#${index + 1}`,
                    guid: `${link}#${index + 1}`,
                };
                const result = parseContent($(item).html());
                return Object.assign(single, result);
            });

        // 记录读取的最后页码
        ctx.cache.set(`/t66y/post/${tid}`, JSON.stringify({ page }));

        // 如果没有读到内容，则读取下一页，最多读取3页
        if (items.length === 0 && retry < 3) {
            retry++; // 记录重试次数
            return load(page + 1);
        } else {
            return { title: title, link: url.resolve(base, `/read.php?tid=${tid}`), item: items };
        }
    };

    ctx.state.data = await load(page);
};
