import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.98zhibo.com';

export const route: Route = {
    path: '/zuqiujijin',
    categories: ['sport'],
    example: '/98zhibo/zuqiujijin',
    name: '足球集锦',
    maintainers: ['chouj'],
    radar: [
        {
            source: ['www.98zhibo.com/zuqiujijin/'],
            target: '/zuqiujijin',
        },
    ],
    handler,
};

// Titles start with the publish date, e.g. 2026年9月9日 欧冠-贝蒂斯客场3-2逆转十人里尔 ...
const parsePubDateFromTitle = (title: string) => {
    const match = title.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);
    return match ? timezone(parseDate(`${match[1]}-${match[2]}-${match[3]}`), 8) : undefined;
};

async function handler(): Promise<Data> {
    const currentUrl = `${baseUrl}/zuqiujijin/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'gbk'));

    const list = $('.list_body_bd li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const title = $link.text();

            return {
                title,
                link: new URL($link.attr('href')!, baseUrl).href,
                pubDate: parsePubDateFromTitle(title),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });
                const $detail = load(iconv.decode(detailResponse.data, 'gbk'));

                const $body = $detail('.Content-body');
                // The hidden block holds the raw match data, the kickoff time is in UTC+8, e.g. 比赛时间：2026-09-09 03:00:00
                const matchTime = $body
                    .find('div[style*="display:none"]')
                    .text()
                    .match(/比赛时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1];

                // Drop inline scripts, HTML comments and the hidden raw data block, keep only the visible content
                $body.find('script, div[style*="display:none"]').remove();
                $body
                    .contents()
                    .filter((_, node) => node.type === 'comment')
                    .remove();

                const $description = $detail('<div>');
                if (matchTime) {
                    $description.append($detail('<p>').text(`比赛时间：${matchTime}`));
                }
                $description.append($body.html() ?? '');

                return {
                    ...item,
                    description: $description.html(),
                };
            })
        )
    );

    return {
        title: '足球集锦 - 98直播吧',
        link: currentUrl,
        language: 'zh-CN',
        item: items,
    };
}
