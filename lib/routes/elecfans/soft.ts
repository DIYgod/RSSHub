import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/soft/:atype',
    categories: ['programming'],
    example: '/elecfans/soft/special',
    parameters: { atype: '需获取资料的类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资料',
    radar: [
        {
            source: ['www.elecfans.com'],
        },
    ],
    maintainers: ['tian051011'],
    handler: async (ctx) => {
        const { atype } = ctx.req.param();
        const response = await ofetch(`https://www.elecfans.com/soft/${atype}/`);
        const $ = load(response);
        const list = $('#mainContent li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').eq(1);
                return {
                    title: a.text(),
                    link: String(a.attr('href')),
                };
            });
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    item.pubDate = parseDate($('.data-info-content2021 .upload-date').eq(1).text());
                    const mid = $('#filed_mid2021').first().text();
                    const userInfoApi = `https://www.elecfans.com/webapi/user/getSoftUserInfo?mid=${mid}`;
                    item.author = await cache.tryGet(userInfoApi, async () => {
                        const userResponse = await ofetch(userInfoApi);
                        return userResponse.data.uname;
                    });
                    item.description = $('.simditor-body').first().html();
                    item.category = $('.nTags a > span')
                        .toArray()
                        .map((item) => $(item).text().trim());

                    return item;
                })
            )
        );
        return {
            title: `elecfans ${atype} softs`,
            link: `https://www.elecfans.com/soft/${atype}/`,
            item: items,
        };
    },
};
