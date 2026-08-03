import { load } from 'cheerio';
import iconv from 'iconv-lite';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

export const route: Route = {
    path: '/:site?/:category{.+}?',
    name: '首页头条',
    maintainers: ['nczitzk', 'pseudoyu'],
    example: '/people',
    handler,
};

async function handler(ctx) {
    const { site = 'www' } = ctx.req.param();
    const { category: requestedCategory = site === 'www' ? '59476' : '' } = ctx.req.param();
    const category = site === 'cpc' && requestedCategory === '24h' ? '64093/64387' : requestedCategory;

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    if (!isValidHost(site)) {
        throw new InvalidParameterError('Invalid site');
    }
    const rootUrl = `http://${site}.people.com.cn`;
    const path = site === 'politics' && !category ? 'GB/1024' : site === 'society' && category === '1008' ? '' : category ? `GB/${category}` : '';
    const requestedUrl = new URL(path, rootUrl).href;
    const { $, url: currentUrl } = await fetchChannel(requestedUrl);
    const articleRootUrl = new URL('/', currentUrl).href;

    $('em').remove();
    $('.bshare-more, .page_n, .page').remove();

    $('a img, h3 img').each((_, e) => {
        $(e).parent().remove();
    });

    let items = $('.p6, div.p2j_list, div.headingNews, div.ej_list_box, .leftItem, div.p2j_con02 > div.fl, div.jsnew_line')
        .find('a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : new URL(link.replace(/^\.\./, ''), articleRootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailPage = await fetchPage(item.link);

                    detailPage.$('.paper_num, #rwb_tjyd').remove();

                    item.description = detailPage.$('#rwb_zw, #rm_txt_zw, .rm_txt_con, .show_text').first().html();
                    item.pubDate = timezone(parseDate(detailPage.html.match(/(\d{4}年\d{2}月\d{2}日\d{2}:\d{2})/)?.[1] || '', 'YYYY年MM月DD日 HH:mm'), 8);
                } catch (error) {
                    item.description = String(error);
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

async function fetchChannel(url: string) {
    const page = await fetchPage(url);
    const refreshElement = page
        .$('meta[http-equiv]')
        .toArray()
        .find((element) => page.$(element).attr('http-equiv')?.toLowerCase() === 'refresh');
    const refreshContent = refreshElement ? page.$(refreshElement).attr('content') : undefined;
    const redirectSeparator = refreshContent?.match(/;\s*url\s*=/i);
    const redirectTarget =
        redirectSeparator?.index === undefined
            ? undefined
            : refreshContent
                  ?.slice(redirectSeparator.index + redirectSeparator[0].length)
                  .trim()
                  .replaceAll(/^['"]|['"]$/g, '');

    if (!redirectTarget) {
        return { ...page, url };
    }

    const redirectUrl = resolvePeopleRedirect(redirectTarget, url);
    if (!redirectUrl) {
        return { ...page, url };
    }

    return { ...(await fetchPage(redirectUrl)), url: redirectUrl };
}

async function fetchPage(url: string) {
    const response = await ofetch(url, {
        responseType: 'arrayBuffer',
    });

    // try to parse charset from meta tag
    let html = iconv.decode(Buffer.from(response), 'utf-8');
    const parsedCharset = html.match(/<meta.*?charset=["']?([^"'>]+)["']?/i);
    const encoding = parsedCharset ? parsedCharset[1].toLowerCase() : 'utf-8';
    html = encoding === 'utf-8' ? html : iconv.decode(Buffer.from(response), encoding);

    return { $: load(html), html };
}

function resolvePeopleRedirect(target: string, sourceUrl: string) {
    try {
        const url = new URL(target, sourceUrl);
        const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
        const isPeopleHost = url.hostname === 'people.com.cn' || url.hostname.endsWith('.people.com.cn');
        return isHttp && isPeopleHost ? url.href : undefined;
    } catch {
        return;
    }
}
