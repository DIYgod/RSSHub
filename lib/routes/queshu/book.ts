import type { Context } from 'hono';

import type { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/book/:bookid',
    categories: ['shopping'],
    example: '/queshu/book/34626813',
    parameters: {
        bookid: '图书ID，可在链接中获取',
    },
    name: '单品活动信息',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx: Context) {
    const { bookid } = ctx.req.param();
    const link = `http://www.queshu.com/book/${bookid}/`;
    const host = 'http://www.queshu.com';

    return await buildData({
        link,
        url: link,
        title: ($) => $('#book_left > #h1').text().trim() + ' - 单品活动信息 - 缺书网',
        description: ($) => $('#detail_intro .detail_body').text().trim(),
        allowEmpty: true,
        item: {
            item: '.stacked.right_state > a',
            title: ($) => $('.right_item .bodycol_258').text(),
            link: ($) => host + $('.right_item').parent().attr('href'),
        },
    });
}
