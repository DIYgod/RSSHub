import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const renderDesc = (item) =>
    renderToString(
        <>
            {item.list?.map((entry) => (
                <>
                    <a href={entry.link}>{entry.title}</a>
                    <br />
                </>
            ))}
        </>
    );

export const route: Route = {
    path: '/zjxwlb/daily',
    categories: ['traditional-media'],
    example: '/cztv/zjxwlb/daily',
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
            source: ['cztv.com/videos/zjxwlb', 'cztv.com/'],
        },
    ],
    name: '浙江新闻联播 - 每日合集',
    maintainers: ['yhkang'],
    handler,
    url: 'cztv.com/videos/zjxwlb',
};

async function handler() {
    const url = 'http://www.cztv.com/videos/zjxwlb';

    const { data: res } = await got(url);
    const $ = load(res);
    const list = $('#videolistss li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('span.t1').text();
            const link = item.find('input[name=data-url]').attr('value');

            return {
                title,
                link,
                pubDate: timezone(parseDate(item.find('span.t2').text() + ' 16:30', 'YYYY-MM-DD hh:mm'), +8),
            };
        });

    const out = {
        title: list[0].title,
        link: list[0].link,
        pubDate: list[0].pubDate,
        description: renderDesc({ list: list.slice(1) }),
    };

    return {
        title: '浙江新闻联播-每日合集',
        link: url,
        item: [out],
    };
}
