import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'https://www.caai.cn';

const urlBase = (caty) => base + `/site/term/${caty}.html`;

const renderDesc = (desc) => renderToString(<>{desc ? raw(desc) : null}</>);

const detailPage = (e, cache) =>
    cache.tryGet(e.link, async () => {
        const result = await got(e.link);
        const $ = load(result.data);
        e.description = $('div.NewsText').html();
        return e;
    });

const fetchAllArticles = ($) => {
    const articles = $('ul.news-list-page > li > a');
    const info = articles.toArray().map((e) => {
        const c = $(e);
        const r = {
            title: c.find('h4').text(),
            link: new URL(c.attr('href'), base).href,
            pubDate: timezone(parseDate(c.find('span.date').text(), 'YYYY-MM-DD'), 8),
        };
        return r;
    });
    return info;
};

export default {
    BASE: base,
    urlBase,
    fetchAllArticles,
    detailPage,
    renderDesc,
};
