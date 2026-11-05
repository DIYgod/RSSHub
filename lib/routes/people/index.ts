import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

const getPublicationDate = (html: string) => {
    const timestamp = html.match(/(\d{4}年\d{2}月\d{2}日\d{2}:\d{2})/)?.[1];
    if (!timestamp) {
        return;
    }
    const date = timezone(parseDate(timestamp, 'YYYY年MM月DD日HH:mm', true), 8);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

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

    const limit = getRouteLimit(ctx, 30);

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
        .map((item): DataItem => {
            const $item = $(item);

            const link = $item.attr('href');

            return {
                title: $item.text(),
                link: link!.startsWith('http') ? link : new URL(link!.replace(/^\.\./, ''), articleRootUrl).href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate'>>(`people:detail:v4:${item.link}`, async () => {
                const detailPage = await fetchPage(item.link!);
                detailPage.$('.paper_num, #rwb_tjyd').remove();

                const mainContent = detailPage.$('#rwb_zw').length ? detailPage.$('#rwb_zw').first() : detailPage.$('#rm_txt_zw').first();

                return {
                    description: (mainContent.length ? mainContent.html() : detailPage.$('.rm_txt_con, .show_text').first().html()) ?? undefined,
                    pubDate: getPublicationDate(detailPage.html),
                };
            });
            return { ...item, description: detail.description, pubDate: detail.pubDate };
        },
        { concurrency: 3, stopOnError: false }
    );

    for (const item of items) {
        const date = item.pubDate === undefined || item.pubDate === null ? undefined : parseDate(item.pubDate);
        if (date && Number.isFinite(date.getTime())) {
            item.pubDate = date;
        } else {
            delete item.pubDate;
        }
    }

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
