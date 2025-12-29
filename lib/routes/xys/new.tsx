import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/new',
    categories: ['blog'],
    example: '/xys/new',
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
            source: ['xys.org/', 'xys.org/new.html'],
        },
    ],
    name: '新到资料',
    maintainers: ['wenzhenl'],
    handler,
    url: 'xys.org/',
};

async function handler(ctx) {
    const rootUrl = 'http://www.xys.org';
    const currentUrl = `${rootUrl}/new.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    // 转码
    const data = iconv.decode(response.data, 'gb2312');

    const $ = load(data);

    let items = $('li a')
        .slice(4, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            let link = item.attr('href');
            /^https?:\/\//.test(link) || (link = rootUrl + '/' + link.replace(/^\//, ''));
            let date = item.parent().text().trim().slice(0, 8);
            date = parseDate(date, 'YY.MM.DD');
            return {
                title: item.text(),
                link,
                pubDate: date,
            };
        });

    items = await Promise.all(
        items
            .filter((item) => !item.link.endsWith('.zip'))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const youTube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-]+)&?/g;
                    const matchYoutube = item.link.match(youTube);

                    if (matchYoutube) {
                        item.description = renderDescription(item.link.slice(32));
                    } else {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            responseType: 'buffer',
                        });

                        // 转码
                        const detailData = iconv.decode(detailResponse.data, 'gb2312');

                        const content = load(detailData);

                        item.description = content.text().replaceAll('\n', '<br>\n');
                    }

                    return item;
                })
            )
    );

    return {
        title: '新语丝 - 新到资料',
        link: currentUrl,
        item: items,
    };
}

const renderDescription = (youTube: string): string =>
    renderToString(<>{youTube ? <iframe width="560" height="315" src={`https://www.youtube-nocookie.com/embed/${youTube}`} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe> : null}</>);
