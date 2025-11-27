import path from 'node:path';

import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.txrjy.com';

export const route: Route = {
    path: '/fornumtopic/:channel?',
    categories: ['bbs'],
    example: '/txrjy/fornumtopic',
    parameters: { channel: '频道的 id，见下表，默认为最新500个主题帖' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '论坛 频道',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 最新 500 个主题帖 | 最新 500 个回复帖 | 最新精华帖 | 最新精华帖 | 一周热帖 | 本月热帖 |
| :---------------: | :---------------: | :--------: | :--------: | :------: | :------: |
|         1         |         2         |      3     |      4     |     5    |     6    |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? '1';
    const url = `${rootUrl}/c114-listnewtopic.php?typeid=${channel}`;

    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const title = $('div.z > a').last().text();
    const list = $('tbody > tr')
        .slice(0, 25)
        .toArray()
        .map((item) => ({
            title: $(item).find('td.title2').text(),
            link: new URL($(item).find('td.title2 > a').attr('href'), rootUrl).href,
            author: $(item).find('td.author').text(),
            pubDate: timezone(parseDate($(item).find('td.dateline').text(), 'YYYY-M-D HH:mm'), +8),
            category: $(item).find('td.forum').text(),
        }))
        .filter((item) => item.title);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    responseType: 'buffer',
                });
                const content = load(iconv.decode(detailResponse.data, 'gbk'));

                item.description = content('div.c_table')
                    .toArray()
                    .map((item) =>
                        art(path.join(__dirname, 'templates/fornumtopic.art'), {
                            content: content(item)
                                .find('td.t_f')
                                .find('div.a_pr')
                                .remove()
                                .end()
                                .html()
                                ?.replaceAll(/(<img.*?) src=".*?"(.*?>)/g, '$1$2')
                                .replaceAll(/(<img.*?)zoomfile(.*?>)/g, '$1src$2'),
                            pattl: content(item)
                                .find('div.pattl')
                                .html()
                                ?.replaceAll(/(<img.*?) src=".*?"(.*?>)/g, '$1$2')
                                .replaceAll(/(<img.*?)zoomfile(.*?>)/g, '$1src$2'),
                            author: content(item).find('a.xw1').text().trim(),
                        })
                    )
                    .join('\n');

                return item;
            })
        )
    );

    return {
        title: `通信人家园 - 论坛 ${title}`,
        link: url,
        item: items,
    };
}
