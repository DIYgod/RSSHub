import { Route } from '@/types';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';

export const route: Route = {
    path: '/previews/:date',
    name: '新番预告',
    maintainers: ['kjasn'],
    example: '/hanime1/previews/202504',
    categories: ['anime'],
    parameters: { date: { description: 'Date in YYYYMM format' } },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hanime1.me/previews/:date'],
            target: '/previews/:date',
        },
    ],
    handler: async (ctx) => {
        const { date } = ctx.req.param();
        const url = `https://hanime1.me/previews/${date}`;

        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            Referer: 'https://hanime1.me/',
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const html = await page.content();
        await browser.close();

        const $ = load(html);

        const items = $('.content-padding .row')
            .toArray()
            .map((el) => {
                const row = $(el);
                // 中文标题
                const title = row.find('.preview-info-content h4').first().text().trim();

                // 预览图
                const coverImage = row.find('.preview-info-cover img').attr('src') || '';

                // 发布时间
                const releaseDate = row.find('.preview-info-cover div').text().trim();

                // 链接
                const modalSelector = row.find('.trailer-modal-trigger').attr('data-target') || '';
                const videoUrl = modalSelector ? $(modalSelector).find('video source').attr('src') || '' : '';

                // 简介
                const description = row.find('.caption').first().text().trim();

                // 标签
                const tags = row
                    .find('.single-video-tag a')
                    .toArray()
                    .map((tag) => $(tag).text().trim());

                return {
                    title,
                    coverImage,
                    releaseDate,
                    videoUrl,
                    description,
                    tags,
                };
            });

        return {
            title: `Hanime1 ${date}新番预告`,
            link: url,
            item: items,
        };
    },
};
