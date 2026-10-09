import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

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
        ],
        requirePuppeteer: false,
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

    const url = `${baseUrl}/portal.php`;
    const data = await ofetch(url, {
        headers: {
            ...(config.xsijishe.cookie && { Cookie: config.xsijishe.cookie }),
        },
    });
    const $ = load(data);
    const items = $('.nex_recon_lists ul li')
        .eq(index)
        .find('.nex_recons_demens dl dd')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h5').text().trim();
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
