import { config } from '@/config';
import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { connect, Options } from 'puppeteer-real-browser';

const realBrowserOption: Options = {
    args: ['--start-maximized'],
    turnstile: true,
    headless: false,
    // disableXvfb: true,
    // ignoreAllFlags:true,
    customConfig: {
        chromePath: config.chromiumExecutablePath,
    },
    connectOption: {
        defaultViewport: null,
    },
    plugins: [],
};

async function getPageWithPuppeteer(url: string, selector: string): Promise<string> {
    if (config.puppeteerRealBrowserService) {
        const res = await fetch(`${config.puppeteerRealBrowserService}?url=${encodeURIComponent(url)}&selector=${encodeURIComponent(selector)}`);
        const json = await res.json();
        return (json.data.at(0) || '') as string;
    } else {
        const { page, browser } = await connect(realBrowserOption);
        await page.goto(url, { timeout: 50000 });
        let verify: boolean | null = null;
        const startDate = Date.now();
        while (!verify && Date.now() - startDate < 50000) {
            // eslint-disable-next-line no-await-in-loop, no-restricted-syntax
            verify = await page.evaluate((sel) => (document.querySelector(sel) ? true : null), selector).catch(() => null);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 1000));
        }
        const html = await page.content();
        await browser.close();
        return html;
    }
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
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod', 'hyoban'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    if (!config.puppeteerRealBrowserService && !config.chromiumExecutablePath) {
        throw new Error('PUPPETEER_REAL_BROWSER_SERVICE or CHROMIUM_EXECUTABLE_PATH is required to use this route.');
    }

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
            const coverLink = $item.find('.cover_link').attr('href');
            const shortcode = coverLink?.split('/')?.[2];
            const image = $item.find('.cover .cover_link img');
            const title = image.attr('alt') || '';

            return {
                title,
                description: `<img src="${image.attr('data-src')}" /><br />${title}`,
                link: `${baseUrl}${coverLink}`,
                guid: shortcode,
                pubDate: parseRelativeDate($item.find('.time .txt').text()),
            };
        });

    // Fetch all post details concurrently
    // First, get HTML for all posts
    let htmlList: string[];
    if (config.puppeteerRealBrowserService) {
        // Use puppeteer service for multiple URLs
        htmlList = (await Promise.all(
            list.map((item) =>
                cache.tryGet(`picnob:user:${id}:${item.guid}:html`, async () => {
                    const selector = '.video_img, .swiper-slide';
                    const res = await fetch(`${config.puppeteerRealBrowserService}?url=${encodeURIComponent(item.link)}&selector=${encodeURIComponent(selector)}`);
                    const json = await res.json();
                    return (json.data?.at(0) || '') as string;
                })
            )
        )) as string[];
    } else {
        // Use local puppeteer browser
        const { browser } = await connect(realBrowserOption);
        try {
            htmlList = (await Promise.all(
                list.map((item) =>
                    cache.tryGet(`picnob:user:${id}:${item.guid}:html`, async () => {
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
                            return await page.content();
                        } catch {
                            return '';
                        } finally {
                            await page.close();
                        }
                    })
                )
            )) as string[];
        } finally {
            await browser.close();
        }
    }

    // Process HTML to generate descriptions
    const newDescription = htmlList.map((html) => {
        if (!html) {
            return '';
        }
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
    });

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
}
