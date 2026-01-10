import { load } from 'cheerio';

import type { DataItem } from '@/types';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

const rootUrl = 'https://sbdji.cc';

const puppeteerGet = (url, cache) =>
    cache.tryGet(url, async () => {
        const browser = await puppeteer();
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
        });
        const html = await page.evaluate(() => document.documentElement.innerHTML);
        await browser.close();
        return html;
    });

export const parseListItem = (item: cheerio.AnyNode): DataItem => {
    const $ = load(item);
    const title = $('h2 > a').attr('title') || $('h2 > a').text();
    const link = $('h2 > a').attr('href');
    const description = $('.note').text();
    const image = $('.focus img').attr('src');

    // Parse time like "1小时前", "1天前"
    const timeText = $('.icon-time').parent().text().trim();
    let pubDate;
    if (timeText.includes('小时前')) {
        const hours = Number.parseInt(timeText, 10);
        pubDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    } else if (timeText.includes('天前')) {
        const days = Number.parseInt(timeText, 10);
        pubDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    } else if (timeText.includes('周前')) {
        const weeks = Number.parseInt(timeText, 10);
        pubDate = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
    } else {
        pubDate = parseDate(timeText);
    }

    return {
        title,
        link,
        description,
        pubDate,
        enclosure_url: image,
        enclosure_type: 'image/jpeg',
    };
};

export const fetchArticle = async (url: string, cacheTryGet: typeof cache.tryGet) => {
    const fullUrl = url.startsWith('http') ? url : `${rootUrl}${url}`;

    const item = await cacheTryGet(fullUrl, async () => {
        const html = await puppeteerGet(fullUrl, cacheTryGet);
        const $ = load(html);

        const content = $('.article-content').html() || '';

        return {
            description: content,
        };
    });

    return item;
};

export const fetchNewsList = async (category: string, limit: number) => {
    let url = `${rootUrl}/news`;
    if (category && category !== 'news') {
        url = `${rootUrl}/category/${category}`;
    }

    const html = await puppeteerGet(url, cache.tryGet);
    const $ = load(html);

    const items = $('.excerpt')
        .slice(0, limit)
        .toArray()
        .map((item) => parseListItem(item));

    return {
        title: 'SBDJI - 全球无人机资讯',
        link: url,
        item: items,
    };
};
