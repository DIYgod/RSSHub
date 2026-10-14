import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const typeMap = {
    ggtz: { url: 'https://www.hafu.edu.cn/index/ggtz.htm', root: 'https://www.hafu.edu.cn/', title: '河南财院 - 公告通知', parseFn: ggtzParse },
    jwc: { url: 'https://jwc.hafu.edu.cn/tzgg.htm', root: 'https://jwc.hafu.edu.cn/', title: '河南财院 教务处 - 公告通知', parseFn: jwcParse },
    zsjyc: { url: 'https://zsjyc.hafu.edu.cn/tztg.htm', root: 'https://zsjyc.hafu.edu.cn/', title: '河南财院 招生就业处 - 公告通知', parseFn: zsjycParse },
};
export const parseList = async (ctx, type) => {
    if (!Object.hasOwn(typeMap, type)) {
        throw new InvalidParameterError('Invalid notice type. Use ggtz, jwc, or zsjyc.');
    }
    const link = typeMap[type].url;
    const title = typeMap[type].title;

    const response = await got(link);
    const $ = load(response.data);

    const resultList = await typeMap[type].parseFn(ctx, $);

    return {
        title,
        link,
        resultList,
    };
};

async function tryGetFullText(link, type) {
    const articleRes = await got(link);
    const articleData = load(articleRes.data);
    let articleBody = articleData('div[class=v_news_content]').html();
    if (articleData('[id^=nattach]').length !== 0) {
        articleBody = tryGetAttachments(articleData, articleBody, type, link);
    }
    if (!articleBody) {
        throw new Error(`Hafu article content was not found at ${link}`);
    }
    const description = renderToString(<>{raw(articleBody)}</>);
    return { articleData, description };
}

function tryGetAttachments(articleData, articleBody, type, articleUrl) {
    const attachments = type === 'ggtz' ? articleData('[id^=nattach]').prev() : articleData('[id^=nattach]').parent().prev();
    return (
        (articleBody ?? '') +
        attachments
            .toArray()
            .map((item) => {
                const element = articleData(item);
                const anchor = element.is('a') ? element : element.find('a').first();
                const href = anchor.attr('href');
                if (!href) {
                    return '';
                }
                const link = new URL(href, articleUrl).href;
                return renderToString(
                    <>
                        <br />
                        <a href={link}>{anchor.text()}</a>
                    </>
                );
            })
            .join('')
    );
}
function parsePublicationDate(value: string | undefined, format: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value, format);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

async function getArticle(link: string, type: string) {
    const { articleData, description } = await tryGetFullText(link, type);
    if (type === 'ggtz') {
        const header = articleData('h1').next().text();
        const index = header.indexOf('日期');
        return {
            description,
            author: index === -1 ? '' : header.slice(0, index - 2),
            pubDate: parsePublicationDate(index === -1 ? undefined : header.slice(index + 3, index + 19), 'YYYY-MM-DD HH:mm'),
        };
    }
    if (type === 'jwc') {
        return { description, author: '供稿单位：' + articleData('span[class=authorstyle259690]').text(), pubDate: undefined };
    }
    return {
        description,
        author: '供稿单位：招生就业处',
        pubDate: parsePublicationDate(articleData('span[class=timestyle127702]').text(), 'YYYY-MM-DD HH:mm'),
    };
}

async function ggtzParse(ctx, $) {
    const data = $('a[class=c269582]').parent().slice(0, getRouteLimit(ctx, 10));
    return await pMap(
        data.toArray(),
        async (item): Promise<DataItem> => {
            const anchor = $(item).find('a[class=c269582]');
            const link = new URL(anchor.attr('href'), typeMap.ggtz.url).href;
            const article = await cache.tryGet(`hafu:article:${link}`, () => getArticle(link, 'ggtz'));
            return {
                title: anchor.attr('title'),
                link,
                ...article,
                pubDate: article.pubDate ?? parsePublicationDate($(item).find('a[class=c269582_date]').text(), 'YYYY-MM-DD'),
            };
        },
        { concurrency: 3 }
    );
}

async function jwcParse(ctx, $) {
    const data = $('a[class=c259713]').parent().parent().slice(0, getRouteLimit(ctx, 10));
    return await pMap(
        data.toArray(),
        async (item): Promise<DataItem> => {
            const anchor = $(item).find('a[class=c259713]');
            const link = new URL(anchor.attr('href'), typeMap.jwc.url).href;
            const article = await cache.tryGet(`hafu:article:${link}`, () => getArticle(link, 'jwc'));
            return {
                title: anchor.attr('title'),
                link,
                ...article,
                pubDate: parsePublicationDate($(item).find('span[class=timestyle259713]').text(), 'YYYY/MM/DD'),
            };
        },
        { concurrency: 3 }
    );
}

async function zsjycParse(ctx, $) {
    const data = $('a[class=c127701]').parent().parent().slice(0, getRouteLimit(ctx, 10));
    return await pMap(
        data.toArray(),
        async (item): Promise<DataItem> => {
            const anchor = $(item).find('a[class=c127701]');
            const link = new URL(anchor.attr('href'), typeMap.zsjyc.url).href;
            const article = await cache.tryGet(`hafu:article:${link}`, () => getArticle(link, 'zsjyc'));
            return {
                title: anchor.attr('title'),
                link,
                ...article,
                pubDate: article.pubDate ?? parsePublicationDate($(item).find('a[class=c269582_date]').text(), 'YYYY-MM-DD'),
            };
        },
        { concurrency: 3 }
    );
}
