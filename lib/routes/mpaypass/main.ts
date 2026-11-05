import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/main/:type?',
    categories: ['new-media'],
    example: '/mpaypass/main/policy',
    parameters: { type: '新闻类型，类型可在URL中找到，类似`policy`，`eye`等，空或其他任意值展示最新新闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['zhuan-zhu'],
    handler,
};

async function handler(ctx) {
    const { type = '' } = ctx.req.param();
    const titleUrl = type ? `http://www.mpaypass.com.cn/${type}.html` : 'http://www.mpaypass.com.cn';

    const response = await got({
        method: 'get',
        url: titleUrl,
    });

    const data = response.data;

    const $ = load(data);

    const titleCn = type ? $(`a[href="http://www.mpaypass.com.cn/${type}.html"], a[href="https://www.mpaypass.com.cn/${type}.html"]`).first().text() : '最新文章';
    const list = $('.newslist')
        .toArray()
        .map((item) => {
            const info = {
                title: $(item).find('#title').text(),
                link: $(item).find('#title').find('a').attr('href'),
                time: $(item).find('#time').text(),
                category: $(item)
                    .find('#keywords')
                    .find('a')
                    .toArray()
                    .map((e) => $(e).text().trim()),
            };
            return info;
        });

    const out = await pMap(
        list,
        async (info) => {
            const details = await cache.tryGet(info.link!, async () => {
                const response = await got(info.link);
                const $ = load(response.data);
                const newsbody = $('div.newsbody').html();

                return {
                    title: info.title,
                    link: info.link,
                    pubDate: timezone(parseDate(info.time), 8),
                    description: newsbody,
                    category: info.category,
                };
            });
            return { ...details, title: info.title, link: info.link, pubDate: timezone(parseDate(info.time), 8), category: info.category };
        },
        { concurrency: 3 }
    );

    return {
        title: `移动支付网-${titleCn}`,
        link: titleUrl,
        item: out,
    };
}
