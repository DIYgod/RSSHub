import { Route } from '@/types';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/:site',
    categories: ['social-media', 'shopping'],
    example: '/bloombergpursuits',
    parameters: { site: 'the site attached to likeshop.me/' },
    radar: [
        {
            source: ['likeshop.me/'],
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Posts',
    maintainers: ['nickyfoto'],
    handler,
    description: 'LikeShop link in bio takes your audience from Instagram and TikTok to your website in one easy step.',
};

async function handler(ctx) {
    const site = ctx.req.param('site');

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        const blockedResources = ['image', 'stylesheet', 'font', 'other'];
        blockedResources.includes(request.resourceType()) ? request.abort() : request.continue();
    });
    const baseUrl = 'https://likeshop.me';
    const link = `${baseUrl}/${site}`;

    await page.goto(link, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 3_000_000,
    });

    const resp = await page.content();
    page.close();

    browser.close();
    const $ = load(resp);
    const title = $('head title').text();

    // Find the main content container first
    const $mainContent = $('#main-content');

    // Extract items from main-content if it exists, otherwise search the entire document
    const items = ($mainContent.length ? $mainContent : $('body'))
        .find('.media-container')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a.media-link').first();
            let href = $link.attr('href');
            if (!href) {
                throw new Error('Invalid href');
            }
            // if href does not start with http, prepend https://likeshop.me
            if (!href.startsWith('http')) {
                href = baseUrl + href;
            }
            const url = new URL(href);
            const cleanUrl = url.origin + url.pathname;

            // Find the image inside the likeshop-image-container
            const $imgContainer = $item.find('.likeshop-image-container');
            const $img = $imgContainer.find('img').first();

            // Get image attributes
            const alt = $img.attr('alt') || 'No description available';
            const src = $img.attr('src');

            // Get webp source if available
            const $webpSource = $imgContainer.find('source[type="image/webp"]').first();
            const webpSrc = $webpSource.attr('srcset') || src;

            // Use the best available image source
            const imageSrc = webpSrc || src;

            // Clean up the image URL by removing size parameters if needed
            const cleanImageSrc = imageSrc?.split('?')[0] || '';

            return {
                title: alt,
                link: cleanUrl,
                description: `<p><img src="${cleanImageSrc}"></p>`,
            };
        });

    return {
        title,
        link,
        item: items,
    };
}
