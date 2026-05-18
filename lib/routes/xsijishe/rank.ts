import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import playwright from '@/utils/playwright';

import { playwrightGet } from './utils';

const baseUrl = 'https://xsijishe.com';

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
        requireConfig: [
            {
                name: 'XSIJISHE_COOKIE',
                description: '',
            },
            {
                name: 'XSIJISHE_USER_AGENT',
                description: '',
            },
        ],
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

    const browser = await playwright();
    const url = `${baseUrl}/portal.php`;
    try {
        const data = await playwrightGet(url, browser, '.nex_recon_lists', {
            cookie: config.xsijishe.cookie,
            userAgent: config.xsijishe.userAgent,
        });
        const $ = load(data);
        const items = $('.nex_recon_lists ul li')
            .eq(index)
            .find('.nex_recons_demens dl dd')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('h5').text().trim();
                const link = item.find('a').attr('href');
                const description = item.find('img').prop('outerHTML') ?? '';

                if (!title || !link) {
                    return;
                }

                return {
                    title,
                    link: new URL(link, `${baseUrl}/`).toString(),
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
    } finally {
        await browser.close();
    }
}
