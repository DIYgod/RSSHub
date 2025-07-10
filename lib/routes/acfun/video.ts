import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/video/:uid',
    radar: [
        {
            source: ['www.acfun.cn/u/:id'],
            target: '/user/video/:id',
        },
    ],
    name: '用户投稿',
    parameters: {
        uid: '用户 UID',
    },
    categories: ['anime'],
    example: '/acfun/user/video/6102',
    view: ViewType.Videos,
    maintainers: ['wdssmq'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const url = `https://www.acfun.cn/u/${uid}`;
    const host = 'https://www.acfun.cn';
    const response = await got(url, {
        headers: {
            Referer: host,
        },
    });
    const data = response.data;

    const $ = load(data);
    const title = $('title').text();
    const description = $('.signature .complete').text();
    const list = $('#ac-space-video-list a').toArray();
    const image = $('head style')
        .text()
        .match(/.user-photo{\n\s*background:url\((.*)\) 0% 0% \/ 100% no-repeat;/)[1];

    return {
        title,
        link: url,
        description,
        image,
        item: list.map((item) => {
            item = $(item);

            const itemTitle = item.find('p.title').text();
            const itemImg = item.find('figure img').attr('src');
            const itemUrl = item.attr('href');
            const itemDate = item.find('.date').text();

            return {
                title: itemTitle,
                description: `<img src="${itemImg.split('?')[0]}">`,
                link: host + itemUrl,
                pubDate: parseDate(itemDate, 'YYYY/MM/DD'),
            };
        }),
    };
}
