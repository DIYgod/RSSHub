const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const dateUtil = require('@/utils/date');
const config = require('@/config').value;

// discuz 7.x 与 discuz x系列 通用文章内容抓取
async function load(baseUrl, itemLink, ctx, charset, header) {
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

    const cache = await ctx.cache.get(itemLink);
    if (cache) {
        return cache;
    }

    // 处理编码问题
    let responseData;
    if (charset === 'utf-8') {
        responseData = (
            await got({
                method: 'get',
                url: itemLink,
                headers: header,
            })
        ).data;
    } else {
        responseData = iconv.decode(
            (
                await got({
                    method: 'get',
                    url: itemLink,
                    responseType: 'buffer',
                    headers: header,
                })
            ).data,
            charset
        );
    }
    if (!responseData) {
        const description = '获取详细内容失败';
        return { description };
    }
    const $ = cheerio.load(responseData);
    // 只抓取论坛1楼消息
    const description = $('div#postlist div[id^=post] td[id^=postmessage]').slice(0, 1).html();
    ctx.cache.set(itemLink, description);
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
        Referer: link,
    };
    const response = await got({
        method: 'get',
        url: link,
        headers: header,
    });
    const contentType = response.headers['content-type'] || '';
    // 若没有指定编码，则默认utf-8
    let charset = 'utf-8';
    for (const attr of contentType.split(';')) {
        if (attr.indexOf('charset=') >= 0) {
            charset = attr.split('=').pop().toLowerCase();
        }
    }
    const responseData =
        charset === 'utf-8'
            ? response.data
            : iconv.decode(
                  (
                      await got({
                          method: 'get',
                          url: link,
                          responseType: 'buffer',
                          headers: {
                              Cookie: cookie,
                          },
                      })
                  ).data,
                  charset
              );
    const $ = cheerio.load(responseData);
    const title = $('head > title').text();
    const version = ver ? 'DISCUZ! ' + ver : $('head > meta[name=generator]').attr('content');
    let process;
    if (version.toUpperCase().startsWith('DISCUZ! 7')) {
        // discuz 7.x 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr').slice(0, 5).get();
        process = await Promise.all(
            list.map(async (item) => {
                item = $(item);
                const itemLink = item.find('span[id^=thread] a').attr('href');
                const single = {
                    title: item.find('span[id^=thread] a').text(),
                    link: itemLink,
                    pubDate: dateUtil(item.find('td.author em').text()),
                };
                const detail = await load(link, itemLink, ctx, charset, header);
                return Promise.resolve(Object.assign({}, single, detail));
            })
        );
    } else if (version.toUpperCase().startsWith('DISCUZ! X')) {
        // discuz X 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr').slice(0, 5).get();
        process = await Promise.all(
            list.map(async (item) => {
                item = $(item);
                const itemLink = item.find('a.xst').attr('href');
                const single = {
                    title: item.find('a.xst').text(),
                    link: itemLink,
                    pubDate: dateUtil(item.find('td.by:nth-child(3) em span').last().text()),
                };
                const detail = await load(link, itemLink, ctx, charset, header);
                return Promise.resolve(Object.assign({}, single, detail));
            })
        );
    } else {
        throw Error('不支持当前Discuz版本.');
    }
    ctx.state.data = {
        title: title,
        link: link,
        item: process,
    };
};
