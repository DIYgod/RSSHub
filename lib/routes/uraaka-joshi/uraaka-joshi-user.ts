import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/:id',
    categories: ['other'],
    example: '/uraaka-joshi/_rrwq',
    parameters: { id: 'User ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['uraaka-joshi.com/:id'],
        },
    ],
    name: 'User',
    maintainers: ['SettingDust', 'Halcao'],
    handler,
    url: 'uraaka-joshi.com/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `https://www.uraaka-joshi.com/user/${id}`;

    const response = await cache.tryGet(
        link,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' ? request.continue() : request.abort();
            });
            page.on('requestfinished', async (request) => {
                if (request.url() === link && request.response().status() === 403) {
                    await page.close();
                }
            });

            let html = '';
            try {
                await page.goto(link, {
                    waitUntil: 'domcontentloaded',
                });
                await page.waitForSelector('#pickup03 .grid-cell');
                await page.waitForSelector('#pickup04 .grid-cell');
                await page.waitForSelector('#main-block .grid-cell');

                html = await page.evaluate(() => document.documentElement.innerHTML);
            } catch {
                throw new Error('Access denied (403)');
            }
            await browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(response);
    const items = $('#main-block .grid .grid-cell')
        .toArray()
        .map((item) => {
            item = $(item);

            // remove event and styles
            item.find('*').removeAttr('onclick');
            item.find('*').removeAttr('onerror');
            item.find('*').removeAttr('style');

            // format account style
            const account = item.find('.account-group-link-row');
            account.html(account.text());

            // extract video tag from its player
            item.find('.plyr--video').each((_, player) => {
                player = $(player);

                const v = player.find('video');
                player.replaceWith(v);
                v.attr('poster', 'https:' + v.attr('data-poster'));
                v.find('source').attr('src', 'https:' + v.find('source').attr('src'));
            });

            // correct src of img tags
            item.find('img').each((_, i) => {
                i = $(i);
                i.attr('src', 'https:' + i.attr('data-src').split('?resize')[0]);
                i.removeAttr('data-src');
            });

            const author = item.find('.account-group').text();
            const categories = item
                .find('.hashtag-item .hashtag')
                .toArray()
                .map((c) => $(c).text().trim());
            const link = item.find('.account-group-link-row').attr('href');
            const date = parseDate(item.find('.profile-char').attr('datetime'));
            const guid = item.find('a.tap-image').attr('data-tweet-id') || item.find('video[class^="js-player-"]').attr('data-tweet-id');

            item.find('.grow-room').remove();
            item.find('div.profile-group.mt10.prl2').eq(1).remove();

            return {
                title: item.find('.profile-text').text(),
                description: item.html(),
                link,
                pubDate: date,
                guid,
                category: categories,
                author,
            };
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        item: items,
    };
}
