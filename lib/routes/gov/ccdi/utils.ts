import { load } from 'cheerio';
import { Cookie, CookieJar } from 'tough-cookie';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const cookieJar = new CookieJar();

const owner = '中央纪委国家监委网站';
export const rootUrl = 'https://www.ccdi.gov.cn';
const regex = /(?<key>[A-Z_]+)=(?<value>.*?(?=; max-age)|[\dA-Fa-f]+)/g;

const parseCookie = async (body) => {
    let m;
    const cookies: Cookie[] = [];
    while ((m = regex.exec(body)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        const { key, value } = m.groups;
        cookies.push(new Cookie({ key, value }));
    }
    await Promise.all(cookies.map((c) => cookieJar.setCookie(c, rootUrl)));
};

const fetchPage = async (url: string, attempt = 0): Promise<string> => {
    const cookie = await cookieJar.getCookieString(url);
    const response = await ofetch.raw<string>(url, { headers: { cookie }, redirect: 'manual' });
    await Promise.all(response.headers.getSetCookie().map((c) => cookieJar.setCookie(c, url)));
    return response.status === 302 && attempt < 2 ? fetchPage(url, attempt + 1) : response._data!;
};

export const parseNewsList = async (url, selector, ctx) => {
    const limit = getRouteLimit(ctx, 20);
    // Detail timestamps can refine the calendar dates on the list page.
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(20, limit);
    const data = await fetchPage(url);
    await parseCookie(data);

    const $ = load(data);
    const list = $(selector)
        .slice(0, candidateLimit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const pubDate = $item.find('.more').text();
            return {
                title: $item.find('a').text().trim(),
                link: new URL($item.find('a').attr('href')!, url).href,
                pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) : undefined,
            };
        });
    const title = $('.other_Location')
        .text()
        .replace(/(.+)首页/, () => owner);
    return { list, title };
};

const changeTrCookie = async () => {
    const cookies = await cookieJar.getCookies(rootUrl);
    const c = cookies.find((c) => c.key === 'HOY_TR');
    if (!c) {
        return;
    }

    const value = c.value;
    const tr_array = value.split(',');
    const csr = tr_array[0];
    const cnv = [...tr_array[1]];
    const otr = [...tr_array[2]];
    otr[0] = csr.charAt(Number.parseInt(cnv[0], 16));
    const nc = new Cookie({ key: 'HOY_TR', value: csr + ',' + cnv.join('') + ',' + otr.join('') + ',0' });
    await cookieJar.setCookie(nc, rootUrl);
};

export const parseArticle = async (item) => {
    await changeTrCookie();
    return cache.tryGet(item.link, async () => {
        const data = await fetchPage(item.link);
        await parseCookie(data);

        const $ = load(data);
        const title = $('.daty, .source-box').text().trim();
        item.author = title.match(/来源：(.*)发布时间/s)?.[1].trim() ?? owner;
        const pubDate = title.match(/发布时间：(.*)分享/s)?.[1].trim();
        if (pubDate) {
            item.pubDate = timezone(parseDate(pubDate), 8);
        }

        // oldsrc is causing freshrss imageproxy not to work correctly
        $('.content, .bom-box').find('img').removeAttr('oldsrc').removeAttr('alt');
        item.description = $('.content, .bom-box').html();
        return item;
    });
};
