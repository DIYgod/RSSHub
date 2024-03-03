// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

const baseUrl = 'https://cqe.uestc.edu.cn/';

const mapUrl = {
    hdyg: 'xwgg/hdyg.htm', // 活动预告
    tzgg: 'xwgg/tzgg.htm', // 通知公告
};

const mapTitle = {
    hdyg: '活动预告',
    tzgg: '通知公告',
};

export default async (ctx) => {
    const type = ctx.req.param('type') || 'tzgg';
    const pageUrl = mapUrl[type];
    if (!pageUrl) {
        throw new Error('type not supported');
    }

    const browser = await puppeteer({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseUrl + pageUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = load(content);

    const items = $('div.Newslist li');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').attr('title');
            const newsLink = baseUrl + item.find('a').attr('href').slice(3);
            const newsPubDate = parseDate(item.find('span').text().slice(1, -1));

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        })
        .get();

    ctx.set('data', {
        title: `大学生文化素质教育中心-${mapTitle[type]}`,
        link: baseUrl,
        description: '电子科技大学大学生文化素质教育中心通知',
        item: out,
    });
};
