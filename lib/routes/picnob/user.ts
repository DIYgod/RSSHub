import { config } from '@/config';
import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';
import { load } from 'cheerio';

async function getPageWithRealBrowser(url: string, selector: string): Promise<string> {
    const res = await fetch(`${config.puppeteerRealBrowserService}?url=${encodeURIComponent(url)}&selector=${encodeURIComponent(selector)}`);
    const json = await res.json();
    return (json.data?.at(0) || '') as string;
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
    if (!config.puppeteerRealBrowserService) {
        throw new Error('PUPPETEER_REAL_BROWSER_SERVICE or CHROMIUM_EXECUTABLE_PATH is required to use this route.');
    }

    // NOTE: 'picnob' is still available, but all requests to 'picnob' will be redirected to 'pixnoy' eventually
    const baseUrl = 'https://www.pixnoy.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const html = await getPageWithRealBrowser(profileUrl, '.post_box');

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

    const htmlList = (await Promise.all(list.map((item) => cache.tryGet(`picnob:user:${id}:${item.guid}:html`, async () => await getPageWithRealBrowser(item.link, '.view'))))) as string[];

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
                description += `<img src="${$(pic).attr('data-src')}" /><br />`;
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
