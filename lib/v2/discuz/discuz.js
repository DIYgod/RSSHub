const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

function fixUrl(itemLink, baseUrl) {
    // 处理相对链接
    if (itemLink) {
        if (baseUrl && !baseUrl.match(/^https?:\/\//)) {
            if (baseUrl.match(/^\/\//)) {
                baseUrl = 'http:' + baseUrl;
            } else {
                baseUrl = 'http://' + baseUrl;
            }
        }
        itemLink = new URL(itemLink, baseUrl).href;
    }
    return itemLink;
}

// discuz 7.x 与 discuz x系列 通用文章内容抓取
async function load(itemLink, charset, header) {
    // 处理编码问题
    const response = await got({
        method: 'get',
        url: itemLink,
        responseType: 'buffer',
        headers: header,
    });

    const responseData = iconv.decode(response.data, charset ?? 'utf-8');
    if (!responseData) {
        const description = '获取详细内容失败';
        return { description };
    }

    const $ = cheerio.load(responseData);

    const post = $('div#postlist div[id^=post] td[id^=postmessage]').first();

    // fix lazyload image
    post.find('img').each((_, img) => {
        img = $(img);
        if (img.attr('src')?.endsWith('none.gif') && img.attr('file')) {
            img.attr('src', img.attr('file') || img.attr('zoomfile'));
            img.removeAttr('file');
            img.removeAttr('zoomfile');
        }
    });

    // 只抓取论坛1楼消息
    const description = post.html();

    return { description };
}

module.exports = async (ctx) => {
    let link = ctx.params.link;
    const ver = ctx.params.ver ? ctx.params.ver.toUpperCase() : undefined;
    const cid = ctx.params.cid;
    link = link.replace(/:\/\//, ':/').replace(/:\//, '://');

    const cookie = cid === undefined ? '' : config.discuz.cookies[cid];
    if (cookie === undefined) {
        throw Error('缺少对应论坛的cookie.');
    }

    const header = {
        Cookie: cookie,
    };

    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: header,
    });

    const responseData = response.data;
    // 若没有指定编码，则默认utf-8
    const contentType = response.headers['content-type'] || '';
    let $ = cheerio.load(iconv.decode(responseData, 'utf-8'));
    const charset = contentType.match(/charset=([^;]*)/)?.[1] ?? $('meta[charset]').attr('charset') ?? $('meta[http-equiv="Content-Type"]').attr('content')?.split('charset=')?.[1];
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = cheerio.load(iconv.decode(responseData, charset ?? 'utf-8'));
    }

    const version = ver ? `DISCUZ! ${ver}` : $('head > meta[name=generator]').attr('content');

    let items;
    if (version.toUpperCase().startsWith('DISCUZ! 7')) {
        // discuz 7.x 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr')
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5)
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('span[id^=thread] a');
                return {
                    title: a.text().trim(),
                    link: fixUrl(a.attr('href'), link),
                    pubDate: item.find('td.author em').length ? parseDate(item.find('td.author em').text().trim()) : undefined,
                    author: item.find('td.author cite a').text().trim(),
                };
            });

        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { description } = await load(item.link, charset, header);

                    item.description = description;
                    return item;
                })
            )
        );
    } else if (version.toUpperCase().startsWith('DISCUZ! X')) {
        // discuz X 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr')
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5)
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a.xst');
                return {
                    title: a.text(),
                    link: fixUrl(a.attr('href'), link),
                    pubDate: item.find('td.by:nth-child(3) em span').last().length ? parseDate(item.find('td.by:nth-child(3) em span').last().text().trim()) : undefined,
                    author: item.find('td.by:nth-child(3) cite a').text().trim(),
                };
            });

        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { description } = await load(item.link, charset, header);

                    item.description = description;
                    return item;
                })
            )
        );
    } else {
        throw Error('不支持当前Discuz版本.');
    }

    ctx.state.data = {
        title: $('head > title').text(),
        description: $('head > meta[name=description]').attr('content'),
        link,
        item: items,
    };
};
