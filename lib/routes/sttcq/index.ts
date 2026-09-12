import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    const items = $('.news-blocks ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $aTag = $item.find('a');

            return {
                title: $aTag.text(),
                description: '停电通知',
                link: `${HOME_PAGE}${$aTag.attr('href')}`,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    return {
        title: $('.main-nav2.clearfix').text(),
        link: url,
        item: items,
    };
}
