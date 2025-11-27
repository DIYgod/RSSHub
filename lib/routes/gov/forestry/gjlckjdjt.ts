import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/forestry/gjlckjdjt/:category?',
    categories: ['government'],
    example: '/gov/forestry/gjlckjdjt',
    parameters: { category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国家林草科技大讲堂',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类     | id   |
| -------- | ---- |
| 经济林   | jjl  |
| 林木良种 | lmlz |
| 林下经济 | lxjj |
| 生态修复 | stxf |
| 用材林   | ycl  |
| 其他     | qt   |`,
};

async function handler(ctx) {
    const { category = 'gjlckjdjt' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.forestry.gov.cn';
    const currentUrl = new URL(`${category}.jhtml`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a.items')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('p.name').text();
            const link = new URL(item.prop('href'), rootUrl).href;
            const pubDateMatches = link.match(/\/\d{8}\//);

            return {
                title,
                link,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item.find('img').prop('src'),
                        alt: title,
                    },
                }),
                pubDate: pubDateMatches ? parseDate(pubDateMatches[1]) : undefined,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('p').each((_, e) => {
                    e = content(e);
                    if (e.find('img, video, embed.edui-faked-video').length === 0 && /^\s*$/.test(e.text())) {
                        e.remove();
                    }
                });

                content('video, embed.edui-faked-video').each((_, e) => {
                    e = content(e);

                    const src = e.prop('src');
                    item.enclosure_url = item.enclosure_url ?? src;

                    e.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            video: {
                                src,
                            },
                        })
                    );
                });

                const pubDateMatches = item.link.match(/\/\d{8}\//);

                item.title = content('div.tit').text();
                item.description += content('div.zhengwen').html();
                item.pubDate = pubDateMatches ? parseDate(pubDateMatches[1]) : undefined;
                item.enclosure_type = item.enclosure_url ? 'video/mp4' : undefined;

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: $('html').prop('lang'),
        image: new URL('r/cms/www/default/zhuanti/2021djt/images/top.png', rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('div.weizhi').contents().last().text(),
        author: '国家林业和草原局',
        allowEmpty: true,
    };
}
