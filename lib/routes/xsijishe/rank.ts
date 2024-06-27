import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const baseUrl = 'https://xsijishe.com';

export const route: Route = {
    path: '/rank/:type',
    categories: ['bbs'],
    example: '/xsijishe/rank/weekly',
    parameters: { type: '排行榜类型: weekly | monthly' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['akynazh'],
    handler,
};

async function handler(ctx) {
    const rankType = ctx.req.param('type');
    let title;
    let rankId;
    if (rankType === 'weekly') {
        title = '司机社综合周排行榜';
        rankId = 'nex_recons_demens';
    } else if (rankType === 'monthly') {
        title = '司机社综合月排行榜';
        rankId = 'nex_recons_demens1';
    } else {
        throw new InvalidParameterError('Invalid rank type');
    }
    const url = `${baseUrl}/portal.php`;
    const resp = await got(url);
    const $ = load(resp.data);
    let items = $(`#${rankId} dd`)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h5').text().trim();
            const link = item.find('a').attr('href');
            return {
                title,
                link: `${baseUrl}/${link}`,
            };
        });
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = load(resp.data);
                const firstViewBox = $('.t_f').first();

                firstViewBox.find('img').each((_, img) => {
                    img = $(img);
                    if (img.attr('zoomfile')) {
                        img.attr('src', img.attr('zoomfile'));
                        img.removeAttr('zoomfile');
                        img.removeAttr('file');
                    }
                    img.removeAttr('onmouseover');
                });

                item.description = firstViewBox.html();
                return item;
            })
        )
    );
    return {
        title,
        link: url,
        description: title,
        item: items,
    };
}
