import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

import { CookieJar, Cookie } from 'tough-cookie';
const cookieJar = new CookieJar();

const owner = '中央纪委国家监委网站';
const rootUrl = 'https://www.ccdi.gov.cn';
const regex = /(?<key>[A-Z_]+)=(?<value>(?:.*?(?=; max-age)|[\dA-Fa-f]+))/gm;

const parseCookie = async (body) => {
    let m;
    const cookies = [];
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

const parseNewsList = async (url, selector, ctx) => {
    const response = await got(url, { cookieJar });
    const data = response.data;
    await parseCookie(data);

    const $ = load(data);
    const list = $(selector)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').first().text().trim(),
                link: new URL(item.find('a').first().attr('href'), url).href,
                pubDate: parseDate(item.find('.more').text(), 'YYYY-MM-DD'),
            };
        });
    const title = $('.other_Location')
        .text()
        .replace(/(.+)首页/, owner);
    return { list, title };
};

const changeTrCookie = async () => {
    const cookies = await cookieJar.getCookies(rootUrl);
    const c = cookies.find((c) => c.key === 'HOY_TR');
    if (c) {
        const value = c.value;
        const tr_array = value.split(',');
        const csr = tr_array[0];
        const cnv = [...tr_array[1]];
        const otr = [...tr_array[2]];
        otr[0] = csr.charAt(Number.parseInt(cnv[0], 16));
        const nc = new Cookie({ key: 'HOY_TR', value: csr + ',' + cnv.join('') + ',' + otr.join('') + ',0' });
        await cookieJar.setCookie(nc, rootUrl);
    }
};

const parseArticle = async (item) => {
    await changeTrCookie();
    return cache.tryGet(item.link, async () => {
        const response = await got(item.link, { cookieJar });
        const data = response.data;
        await parseCookie(data);

        const $ = load(data);
        const title = $('.daty, .source-box').text().trim();
        item.author = title.match(/来源：(.*)发布时间/s)?.[1].trim() ?? owner;
        item.pubDate = timezone(parseDate(title.match(/发布时间：(.*)分享/s)?.[1].trim() ?? item.pubDate), +8);

        // Change the img src from relative to absolute for a better compatibility
        $('.content, .bom-box')
            .find('img')
            .each((_, el) => {
                $(el).attr('src', new URL($(el).attr('src'), item.link).href);
                // oldsrc is causing freshrss imageproxy not to work correctly
                $(el).removeAttr('oldsrc').removeAttr('alt');
            });
        item.description = $('.content, .bom-box').html();
        return item;
    });
};

export { rootUrl, parseNewsList, parseArticle };
