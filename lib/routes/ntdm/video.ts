import { Route } from '@/types';
import got from '@/utils/got';
import { rootUrl } from './utils';
import { load } from 'cheerio';

export const route: Route = {
    path: '/video/:id',
    categories: ['anime'],
    example: '/ntdm/video/4309',
    parameters: { id: '番剧 id，对应详情 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ntdm9.com/video/:id'],
        },
    ],
    name: '番剧详情',
    maintainers: ['Yamico'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `${rootUrl}/video/${id}.html`;
    const response = await got(url);
    const $ = load(response.data);

    const dmtitle = $('.detail_imform_name').text();
    const dmdesc = $('.detail_imform_desc_pre').text();

    const items = $('.movurl.mod ul')
        .first()
        .find('li')
        .toArray()
        .map((item) => {
            const dom = $(item);
            const a = dom.find('a');
            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
            };
        })
        .toReversed();
    return {
        title: `NT动漫 - ${dmtitle}`,
        link: `${rootUrl}/video/${id}.html`,
        description: dmdesc,
        item: items,
    };
}
