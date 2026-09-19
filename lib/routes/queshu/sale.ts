import type { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/sale',
    categories: ['shopping'],
    example: '/queshu/sale',
    name: '促销',
    maintainers: ['kt286'],
    handler,
};

async function handler() {
    const link = 'http://www.queshu.com/sale/';
    const host = 'http://www.queshu.com';

    return await buildData({
        link,
        url: link,
        title: '图书促销 - 缺书网',
        item: {
            item: '#tb_sale tr',
            title: ($) => $('.news_sale_detail .sale_btn').text() + '：' + $('.news_sale_title a').text(),
            link: ($) => host + $('.news_sale_title a').attr('href'),
            description: ($) =>
                $('.news_sale_detail .sale_btn').text() +
                '：' +
                $('.news_sale_title a').text() +
                '<br>' +
                $('.news_sale_detail .sale_time_end').first().text() +
                '<br>' +
                '发布时间：' +
                $('.news_sale_detail .sale_time_end.inline_right').text(),
        },
    });
}
