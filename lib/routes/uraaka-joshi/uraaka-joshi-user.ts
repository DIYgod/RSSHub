import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import type { Page } from '@/utils/playwright';
import { getPlaywrightPage } from '@/utils/playwright';

const configurePage = async (page: Page) => {
    await page.route('**/*', async (route) => {
        const request = route.request();
        await (['document', 'script', 'fetch'].includes(request.resourceType()) ? route.continue() : route.abort());
    });
};
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
            source: ['uraaka-joshi.com/:id', 'uraaka-joshi.com/user/:id'],
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
            const { page, destroy } = await getPlaywrightPage(link, {
                closeTimeout: 0,
                noGoto: true,
                onBeforeLoad: configurePage,
            });
            try {
                const response = await page.goto(link, {
                    waitUntil: 'domcontentloaded',
                });
                if (response && response.status() >= 400) {
                    throw new Error(`The source returned HTTP ${response.status()} for ${link}`);
                }
                await page.waitForSelector('#pickup03 .grid-cell');
                await page.waitForSelector('#pickup04 .grid-cell');
                await page.waitForSelector('#main-block .grid-cell');
                const html = await page.evaluate(() => document.documentElement.getHTML());
                return html;
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );
    const $ = load(response);
    const items = $('#main-block .grid .grid-cell')
        .toArray()
        .map((item) => {
            const $item = $(item);
            // remove event and styles
            $item.find('*').removeAttr('onclick');
            $item.find('*').removeAttr('onerror');
            $item.find('*').removeAttr('style');
            // format account style
            const account = $item.find('.account-group-link-row');
            account.html(account.text());
            // extract video tag from its player
            $item.find('.plyr--video').each((_, player) => {
                const $player = $(player);
                const v = $player.find('video');
                $player.replaceWith(v);
                v.attr('poster', 'https:' + v.attr('data-poster'));
                v.find('source').attr('src', 'https:' + v.find('source').attr('src'));
            });
            // correct src of img tags
            $item.find('img').each((_, i) => {
                const $i = $(i);
                $i.attr('src', 'https:' + $i.attr('data-src')!.split('?resize', 1)[0]);
                $i.removeAttr('data-src');
            });
            const author = $item.find('.account-group').text();
            const categories = $item
                .find('.hashtag-item .hashtag')
                .toArray()
                .map((c) => $(c).text().trim());
            const link = $item.find('.account-group-link-row').attr('href');
            const date = parseDate($item.find('.profile-char').attr('datetime')!);
            const guid = $item.find('a.tap-image').attr('data-tweet-id') || $item.find('video[class^="js-player-"]').attr('data-tweet-id');
            $item.find('.grow-room').remove();
            $item.find('div.profile-group.mt10.prl2').eq(1).remove();
            return {
                title: $item.find('.profile-text').text(),
                description: $item.html(),
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
