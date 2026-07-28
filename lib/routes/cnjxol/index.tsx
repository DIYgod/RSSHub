import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const categories = {
    jxrb: '嘉兴日报',
    nhwb: '南湖晚报',
};

export const route: Route = {
    path: '/jxrb/:id?',
    categories: ['traditional-media'],
    example: '/cnjxol/jxrb',
    parameters: { id: '编号，见下表，默认为全部' },
    radar: [
        {
            source: ['cnjxol.com/'],
            target: '/jxrb/:id',
        },
    ],
    description: `| 版                   | 编号 |
| -------------------- | ---- |
| 全部                 |      |
| 第 01 版：要闻       | 01   |
| 第 02 版：要闻       | 02   |
| 第 03 版：要闻       | 03   |
| 第 04 版：嘉一度     | 04   |
| 第 05 版：聚焦       | 05   |
| 第 06 版：党报热线   | 06   |
| 第 07 版：天下       | 07   |
| 第 08 版：聚焦       | 08   |
| 第 09 版：南湖新闻   | 09   |
| 第 10 版：综合       | 10   |
| 第 11 版：梅花洲     | 11   |
| 第 12 版：南湖纵横   | 12   |
| 第 13 版：秀洲新闻   | 13   |
| 第 14 版：综合       | 14   |
| 第 15 版：秀・观察   | 15   |
| 第 16 版：走进高新区 | 16   |`,
    features: {
        antiCrawler: true,
    },
    name: '嘉兴日报',
    maintainers: ['nczitzk'],
    handler,
};

export async function handler(ctx) {
    const category = getSubPath(ctx).split('/', 2)[1];
    const id = ctx.req.param('id');

    const rootUrl = `https://${category}.cnjxol.com`;
    const currentUrl = `${rootUrl}/${category}Paper/pc/layout`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);
    const dateMatch = $('a')
        .first()
        .attr('href')
        .match(/\d{6}\/\d{2}/)[0];

    let items = [];

    if (id) {
        const pageUrl = `${currentUrl}/${dateMatch}/node_${id}.html`;

        const pageResponse = await got({
            method: 'get',
            url: pageUrl,
        });

        $ = load(pageResponse.data);

        items = $('#articlelist .clearfix a')
            .toArray()
            .map((a) => `${currentUrl}/${$(a).attr('href')}`.replaceAll('layout/../../../', ''));
    } else {
        await Promise.all(
            $('#list li a')
                .toArray()
                .map(async (p) => {
                    const pageResponse = await got({
                        method: 'get',
                        url: `${currentUrl}/${$(p).attr('href')}`,
                    });

                    const page = load(pageResponse.data);

                    items.push(
                        ...page('#articlelist .clearfix a')
                            .toArray()
                            .map((a) => `${currentUrl}/${page(a).attr('href')}`.replaceAll('layout/../../../', ''))
                    );
                })
        );
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item,
                });

                const content = load(detailResponse.data);

                const attachment = content('.attachment').html();
                const contentHtml = content('founder-content').html();
                return {
                    link: item,
                    title: content('#Title').text(),
                    pubDate: parseDate(content('date').text()),
                    description: renderToString(
                        <>
                            {attachment ? raw(attachment) : null}
                            {contentHtml ? raw(contentHtml) : null}
                        </>
                    ),
                };
            })
        )
    );

    return {
        title: `${categories[category]}${id ? ` - ${$('#layout').text()}` : ''}`,
        link: currentUrl,
        item: items,
    };
}
