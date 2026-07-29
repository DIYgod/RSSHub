import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['multimedia'],
    example: '/zyshow/chongchongchong',
    parameters: { path: '综艺 id，综艺详情对应页 URL 中找到' },
    features: {
        antiCrawler: true,
    },
    name: '综艺',
    maintainers: ['pharaoh2012', 'nczitzk'],
    description: `地区，见下表，默认为空，即台湾

| 台湾 | 韩国 | 大陆 |
| ---- | ---- | ---- |
|      | kr   | dl   |`,
    handler,
};

async function handler(ctx) {
    const rootUrl = 'http://www.zyshow.net';
    const path = ctx.req.param('path')?.replace(/\/$/, '');
    const currentUrl = `${rootUrl}${path ? `/${path}` : ''}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('table')
        .last()
        .find('tr td a img.icon-play')
        .toArray()
        .map((item) => {
            item = $(item).parentsUntil('tbody');

            const a = item.find('a[title]').first();
            const guests = item.find('td').eq(2).text();

            return {
                title: a.text(),
                link: `${currentUrl}v/${a.attr('href').split('/v/').pop()}`,
                pubDate: parseDate(a.text().match(/(\d{8})$/)[1], 'YYYYMMDD'),
                description: renderToString(<ZyshowDescription date={item.find('td').first().text()} subject={item.find('td').eq(1).text()} guests={guests} link={`${currentUrl}v/${a.attr('href').split('/v/').pop()}`} />),
                category: guests.split(/,|;/),
            };
        });

    return {
        title: `综艺秀 - ${$('h2').text()}`,
        link: currentUrl,
        item: items,
    };
}

const ZyshowDescription = ({ link, date, subject, guests }: { link: string; date: string; subject: string; guests: string }) => (
    <table>
        <tbody>
            <tr>
                <td>播出日期：</td>
                <td>
                    <b>
                        <a href={link}>{date}</a>
                    </b>
                </td>
            </tr>
            <tr>
                <td>节目主题：</td>
                <td>
                    <b>{subject}</b>
                </td>
            </tr>
            <tr>
                <td>节目来宾：</td>
                <td>
                    <b>{guests}</b>
                </td>
            </tr>
        </tbody>
    </table>
);
