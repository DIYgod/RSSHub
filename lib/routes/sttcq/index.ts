import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/:province/:city/:district?',
    categories: ['forecast'],
    example: '/sttcq/hb1/wh/wc',
    parameters: {
        province: '省，2~3位拼音缩写，详情见 https://www.sttcq.com/td/',
        city: '市，同上',
        district: '区，同上',
    },
    radar: [
        {
            source: ['www.sttcq.com/td/:province/:city/:district/', 'www.sttcq.com/td/:province/:city/', 'www.sttcq.com/td/:province/'],
        },
    ],
    name: '95598 停电查询网',
    maintainers: ['mjysci'],
    handler,
};

const HOME_PAGE = 'https://www.sttcq.com';

async function handler(ctx: Context) {
    const { province, city, district } = ctx.req.param();

    const url = district ? `${HOME_PAGE}/td/${province}/${city}/${district}/` : `${HOME_PAGE}/td/${province}/${city}/`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.news-blocks ul li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const $aTag = $item.find('a');

            return {
                title: $aTag.find('.news-title').text(),
                description: '停电通知',
                link: `${HOME_PAGE}${$aTag.attr('href')}`,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`sttcq:notice:v3:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                const description = content('.content').html();
                const publishedAt = content('.article-info .time').text().slice(5);
                const editor = content('.article-info .form')
                    .toArray()
                    .map((element) => content(element).text())
                    .find((text) => text.startsWith('编辑：'));
                return { description, pubDate: parseDate(publishedAt, 8), author: editor?.slice(3) };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('.main-nav2.clearfix').text(),
        link: url,
        item: items,
    };
}
