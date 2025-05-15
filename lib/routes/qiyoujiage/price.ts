import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import md5 from '@/utils/md5';

export const route: Route = {
    path: '/:path{.+}',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path');
    const link = `http://www.qiyoujiage.com/${path}.shtml`;

    const { data: response } = await got(link);
    const $ = load(response);

    const priceText = $('#youjia').text();
    const item = [
        {
            title: priceText,
            description: $('#youjia').html(),
            link,
            guid: `${link}#${md5(priceText)}`,
        },
    ];

    return {
        title: $('title').text(),
        description: $('meta[name="Description"]').attr('content'),
        link,
        item,
    };
}
