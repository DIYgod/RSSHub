import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mdadmission',
    categories: ['university'],
    example: '/pumc/mdadmission',
    parameters: {},
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
            source: ['mdadmission.pumc.edu.cn/mdweb/site', 'mdadmission.pumc.edu.cn/'],
        },
    ],
    name: '“4+4” 试点班招生网通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'mdadmission.pumc.edu.cn/mdweb/site',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 100;

    const rootUrl = 'https://mdadmission.pumc.edu.cn';
    const currentUrl = `${rootUrl}/mdweb/site!noticeList?param.infoTypeId=&rows=${limit}&pages=1`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    let items = $('div.media')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h4.media-heading a');

            return {
                title: a.text(),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: parseDate(item.find('span').first().text(), 'DDYYYY-MM'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = load(detailResponse.data);

                content('h3').remove();

                item.description = content('div.media-body div').last().html();

                return item;
            })
        )
    );

    return {
        title: '北京协和医学院招生网 - 通知公告',
        link: currentUrl,
        item: items,
    };
}
