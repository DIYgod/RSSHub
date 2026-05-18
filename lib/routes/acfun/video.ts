import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/user/video/:uid/:embed?',
    radar: [
        {
            source: ['www.acfun.cn/u/:id'],
            target: '/user/video/:id',
        },
    ],
    name: '用户投稿',
    parameters: {
        uid: '用户 UID',
        embed: '默认为开启内嵌视频, 任意值为关闭',
    },
    categories: ['anime'],
    example: '/acfun/user/video/6102',
    view: ViewType.Videos,
    maintainers: ['wdssmq'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');
    const host = 'https://www.acfun.cn';
    const link = `${host}/u/${uid}`;
    const response = await ofetch(link);

    const $ = load(response);
    const title = $('title').text();
    const description = $('.signature .complete').text();
    const list = $('#ac-space-video-list a').toArray();
    const image = $('head style:contains("user-photo")')
        .text()
        .match(/.user-photo{\n\s*background:url\((.*)\) 0% 0% \/ 100% no-repeat;/)?.[1];

    return {
        title,
        link,
        description,
        image,
        item: list.map((item) => {
            const $item = $(item);

            const itemTitle = $item.find('p.title').text();
            const itemImg = $item.find('figure img').attr('src');
            const itemUrl = $item.attr('href')!;
            const itemDate = $item.find('.date').text();
            const wbInfo = JSON.parse(($item.data('wb-info') as string) || '{}');
            const aid = wbInfo.atmid || wbInfo.mediaId || itemUrl.match(/\/v\/(ac\d+)/)?.[1];

            return {
                title: itemTitle,
                description: renderDescription({ embed, aid, img: itemImg?.split('?')[0] }),
                link: host + itemUrl,
                pubDate: parseDate(itemDate, 'YYYY/MM/DD'),
            };
        }),
    };
}
