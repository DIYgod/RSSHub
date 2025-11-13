import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { connect } from 'puppeteer-real-browser';
import sanitizeHtml from 'sanitize-html';

const realBrowserOption = {
    args: ['--start-maximized'],
    turnstile: true,
    headless: false,
    // disableXvfb: true,
    // ignoreAllFlags:true,
    customConfig: {},
    connectOption: {
        defaultViewport: null,
    },
    plugins: [],
};

async function getPageWithPuppeteer(url: string, selector: string): Promise<string> {
    const { page, browser } = await connect(realBrowserOption);
    await page.goto(url);
    let verify: boolean | null = null;
    const startDate = Date.now();
    while (!verify && Date.now() - startDate < 30000) {
        // eslint-disable-next-line no-await-in-loop, no-restricted-syntax
        verify = await page.evaluate((sel) => (document.querySelector(sel) ? true : null), selector).catch(() => null);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1000));
    }
    const html = await page.content();
    await browser.close();
    return html;
}

function getProfilePage(profileUrl: string): Promise<string> {
    return getPageWithPuppeteer(profileUrl, '.post_box');
}

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media'],
    example: '/picnob/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: 'Type of profile page (profile or tagged)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.pixnoy.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['www.pixnoy.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    // NOTE: 'picnob' is still available, but all requests to 'picnob' will be redirected to 'pixnoy' eventually
    const baseUrl = 'https://www.pixnoy.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const html = await getProfilePage(profileUrl);

    const $ = load(html);

    const list = $('.post_box')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const sum = $item.find('.sum').text();
            const coverLink = $item.find('.cover_link').attr('href');
            const shortcode = coverLink?.split('/')?.[2];

            return {
                title: sanitizeHtml(sum.split('\n')[0], { allowedTags: [], allowedAttributes: {} }),
                description: `<img src="${$item.find('.preview_w img').attr('data-src')}" /><br />${sum.replaceAll('\n', '<br>')}`,
                link: `${baseUrl}${coverLink}`,
                guid: shortcode,
                pubDate: parseRelativeDate($item.find('.time .txt').text()),
            };
        });

    // Fetch all post details concurrently using a single browser instance
    const { browser } = await connect(realBrowserOption);
    try {
        const newDescription = await Promise.all(
            list.map((item) =>
                cache.tryGet(`picnob:user:${id}:${item.guid}`, async () => {
                    const page = await browser.newPage();
                    try {
                        await page.goto(item.link, { timeout: 50000 });
                        let verify: boolean | null = null;
                        const startDate = Date.now();
                        while (!verify && Date.now() - startDate < 50000) {
                            // eslint-disable-next-line no-await-in-loop, no-restricted-syntax
                            verify = await page.evaluate(() => (document.querySelector('.video_img') || document.querySelector('.swiper-slide') ? true : null)).catch(() => null);
                            // eslint-disable-next-line no-await-in-loop
                            await new Promise((r) => setTimeout(r, 1000));
                        }
                        const html = await page.content();
                        const $ = load(html);
                        if ($('.video_img').length > 0) {
                            return `<video src="${$('.video_img a').attr('href')}" poster="${$('.video_img img').attr('data-src')}"></video><br />${$('.sum_full').text()}`;
                        } else {
                            let description = '';
                            for (const slide of $('.swiper-slide').toArray()) {
                                const $slide = $(slide);
                                description += `<img src="${$slide.find('.pic img').attr('data-src')}" /><br />`;
                            }
                            description += $('.sum_full').text();
                            return description;
                        }
                    } catch {
                        return '';
                    } finally {
                        await page.close();
                    }
                })
            )
        );

        return {
            title: `${$('h1.fullname').text()} (@${id}) ${type === 'tagged' ? 'tagged' : 'public'} posts - Picnob`,
            description: $('.info .sum').text(),
            link: profileUrl,
            image: $('.ava .pic img').attr('src'),
            item: list.map((item, index) => ({
                ...item,
                description: newDescription[index] || item.description,
            })),
        };
    } finally {
        await browser.close();
    }
}
