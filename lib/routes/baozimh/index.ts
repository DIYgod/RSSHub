import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

const rootUrl = 'https://www.baozimh.com';

export const route: Route = {
    path: '/comic/:name',
    categories: ['anime'],
    example: '/baozimh/comic/guowangpaiming-shiricaofu',
    parameters: { name: '漫画名称，在漫画链接可以得到(`comic/` 后的那段)' },
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
            source: ['www.baozimh.com/comic/:name'],
        },
    ],
    name: '订阅漫画',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const url = `${rootUrl}/comic/${name}`;

    const response = await got(url);
    const $ = load(response.data);
    const comicTitle = $('div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > h1').text();
    const list = $('#layout > div.comics-detail > div:nth-child(3) > div > div.pure-g')
        .first() // 最新章节
        .children()
        .toArray()
        .map((item) => {
            const title = $(item).find('span').text();
            const link = rootUrl + $(item).find('a').attr('href');

            return {
                title,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);
                item.description = art(path.join(__dirname, 'templates/desc.art'), {
                    imgUrlList: $('.comic-contain')
                        .find('amp-img')
                        .toArray()
                        .map((item) => $(item).attr('src')),
                });

                return item;
            })
        )
    );

    return {
        title: `包子漫画-${comicTitle}`,
        description: $('.comics-detail__desc').text(),
        link: url,
        item: items,
    };
}
