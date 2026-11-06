import { load } from 'cheerio';

import { config } from '@/config';
import CaptchaError from '@/errors/types/captcha';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';

import { baseUrl, browserResourceTypes, isBlockedRequest, toBrowserCookies } from './utils';

const rankSelector = '.nex_recon_lists';

export const route: Route = {
    path: '/rank/:type',
    categories: ['bbs'],
    example: '/xsijishe/rank/weekly',
    parameters: {
        type: {
            description: '排行榜类型',
            options: [
                { value: 'weekly', label: '周榜' },
                { value: 'monthly', label: '月榜' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '排行榜',
    maintainers: ['akynazh', 'AiraNadih'],
    handler,
};

async function fetchPortal(url: string) {
    const cookie = config.xsijishe.cookie;
    try {
        return await ofetch<string>(url, {
            headers: {
                ...(cookie && { Cookie: cookie }),
            },
        });
    } catch (error) {
        if (!isBlockedRequest(error)) {
            throw error;
        }
    }

    const { page, destroy } = await getPlaywrightPage(url, {
        noGoto: true,
        closeTimeout: 0,
        onBeforeLoad: async (_page, context) => {
            if (cookie) {
                await context!.addCookies(toBrowserCookies(cookie));
            }
            await context!.route('**/*', (route) => (browserResourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        try {
            await page.waitForSelector(rankSelector, { state: 'attached', timeout: 20000 });
        } catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                throw new CaptchaError('Xsijishe did not show its rank list in the browser. It may still be requesting browser verification; retry later.');
            }
            throw error;
        }
        return await page.content();
    } finally {
        await destroy();
    }
}

async function handler(ctx) {
    const rankType = ctx.req.param('type');
    let title;
    let index;

    if (rankType === 'weekly') {
        title = '司机社综合周排行榜';
        index = 0;
    } else if (rankType === 'monthly') {
        title = '司机社综合月排行榜';
        index = 1;
    } else {
        throw new InvalidParameterError('Invalid rank type');
    }

    const url = `${baseUrl}/portal.php`;
    const data = await fetchPortal(url);
    const $ = load(data);
    const items = $(`${rankSelector} ul li`)
        .eq(index)
        .find('.nex_recons_demens dl dd')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h5').text();
            const link = $item.find('a').attr('href');
            const description = $item.find('img').prop('outerHTML') ?? '';

            if (!title || !link) {
                return;
            }

            return {
                title,
                link: new URL(link, `${baseUrl}/`).href,
                description,
            };
        })
        .filter((item) => item !== undefined);

    return {
        title,
        link: url,
        description: title,
        item: items,
    };
}
