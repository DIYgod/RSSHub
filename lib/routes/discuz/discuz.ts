import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

function fixUrl(itemLink, baseUrl) {
    // 处理相对链接
    if (itemLink) {
        if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
            baseUrl = baseUrl.startsWith('//') ? 'http:' + baseUrl : 'http://' + baseUrl;
        }
        itemLink = new URL(itemLink, baseUrl).href;
    }
    return itemLink;
}

// discuz 7.x 与 discuz x系列 通用文章内容抓取
async function loadContent(itemLink, charset, header) {
    // 处理编码问题
    const response = await ofetch.raw(itemLink, {
        method: 'get',
        responseType: 'arrayBuffer',
        headers: header,
    });

    const responseData = iconv.decode(Buffer.from(response._data), charset ?? 'utf-8');
    if (!responseData) {
        const description = '获取详细内容失败';
        return { description };
    }

    const $ = load(responseData);

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

export const route: Route = {
    path: ['/:ver{[7x]}/:cid{[0-9]{2}}/:link{.+}', '/:ver{[7x]}/:link{.+}', '/:link{.+}'],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    let link = ctx.req.param('link');
    const ver = ctx.req.param('ver') ? ctx.req.param('ver').toUpperCase() : undefined;
    const cid = ctx.req.param('cid');
    link = link.replace(/:\/\//, ':/').replace(/:\//, '://');

    const cookie = cid === undefined ? '' : config.discuz.cookies[cid];
    if (cookie === undefined) {
        throw new ConfigNotFoundError('缺少对应论坛的cookie.');
    }

    const header = {
        Cookie: cookie,
    };

    const response = await ofetch.raw(link, {
        method: 'get',
        responseType: 'arrayBuffer',
        headers: header,
    });

    const responseData = Buffer.from(response._data);
    // 若没有指定编码，则默认utf-8
    const contentType = response.headers['content-type'] || '';
    let $ = load(iconv.decode(responseData, 'utf-8'));
    const charset = contentType.match(/charset=([^;]*)/)?.[1] ?? $('meta[charset]').attr('charset') ?? $('meta[http-equiv="Content-Type"]').attr('content')?.split('charset=')?.[1];
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(responseData, charset ?? 'utf-8'));
    }

    const version = ver ? `DISCUZ! ${ver}` : $('head > meta[name=generator]').attr('content');

    let items;
    if (version.toUpperCase().startsWith('DISCUZ! 7')) {
        // discuz 7.x 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr')
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5)
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
                cache.tryGet(item.link, async () => {
                    const { description } = await loadContent(item.link, charset, header);

                    item.description = description;
                    return item;
                })
            )
        );
    } else if (version.toUpperCase().startsWith('DISCUZ! X')) {
        // discuz X 系列
        // 支持全文抓取，限制抓取页面5个
        const list = $('tbody[id^="normalthread"] > tr')
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5)
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
                cache.tryGet(item.link, async () => {
                    const { description } = await loadContent(item.link, charset, header);

                    item.description = description;
                    return item;
                })
            )
        );
    } else {
        throw new InvalidParameterError('不支持当前Discuz版本.');
    }

    return {
        title: $('head > title').text(),
        description: $('head > meta[name=description]').attr('content'),
        link,
        item: items,
    };
}
