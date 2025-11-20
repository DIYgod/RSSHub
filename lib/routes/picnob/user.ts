import { config } from '@/config';
import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { connect, Options, ConnectResult } from 'puppeteer-real-browser';

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

async function getPageWithRealBrowser(url: string, selector: string, conn: ConnectResult | null) {
    try {
        if (conn) {
            const page = conn.page;
            await page.goto(url, { timeout: 30000 });
            let verify: boolean | null = null;
            const startDate = Date.now();
            while (!verify && Date.now() - startDate < 30000) {
                // eslint-disable-next-line no-await-in-loop, no-restricted-syntax
                verify = await page.evaluate((sel) => (document.querySelector(sel) ? true : null), selector).catch(() => null);
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, 1000));
            }
            return await page.content();
        } else {
            const res = await fetch(`${config.puppeteerRealBrowserService}?url=${encodeURIComponent(url)}&selector=${encodeURIComponent(selector)}`);
            const json = await res.json();
            return (json.data?.at(0) || '') as string;
        }
    } catch {
        return '';
    }
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
    name: 'User Profile - Pixnoy',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod', 'hyoban', 'Rongronggg9'],
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

    let conn: ConnectResult | null = null;

    if (!config.puppeteerRealBrowserService) {
        conn = await connect(realBrowserOption);

        setTimeout(async () => {
            if (conn) {
                await conn.browser.close();
            }
        }, 60000);
    }

    const html = await getPageWithRealBrowser(profileUrl, '.post_box', conn);
    if (!html) {
        if (conn) {
            await conn.browser.close();
            conn = null;
        }
        throw new Error('Failed to fetch user profile page. User may not exist or there are no posts available.');
    }

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

    const jobs = list.map((item) => cache.tryGet(`picnob:user:${id}:${item.guid}:html`, async () => await getPageWithRealBrowser(item.link, '.view', conn)));

    let htmlList: string[] = [];
    if (conn) {
        try {
            for (const job of jobs) {
                // eslint-disable-next-line no-await-in-loop
                const html = await job;
                htmlList.push(html);
            }
        } finally {
            await conn.browser.close();
            conn = null;
        }
    } else {
        htmlList = await Promise.all(jobs);
    }

    const newDescription = htmlList.map((html) => {
        if (!html) {
            return '';
        }
        const $ = load(html);
        if ($('.video_img').length > 0) {
            return `<video src="${$('.video_img a').attr('href')}" poster="${$('.video_img img').attr('data-src')}"></video><br />${$('.sum_full').text()}`;
        } else {
            let description = '';
            for (const pic of $('.pic img').toArray()) {
                const dataSrc = $(pic).attr('data-src');
                if (dataSrc) {
                    description += `<img src="${dataSrc}" /><br />`;
                }
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
