import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { userUrl, appsUrl } from '../utils';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/user/:lang?/appComment/:uid',
    categories: ['anime'],
    example: '/qoo-app/user/en/appComment/35399143',
    parameters: { lang: 'Language, see the table above, empty means `中文`', uid: 'User ID, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Game Comments',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { uid, lang = '' } = ctx.req.param();
    const link = `${userUrl}${lang ? `/${lang}` : ''}/${uid}`;

    const { data: response } = await got(link);
    const { data } = await got(`${userUrl}/getUserAppCommentList`, {
        searchParams: {
            fid: uid,
        },
    });

    const $ = load(response);
    const username = $('.person .name').text();

    const items = data.list.map((item) => ({
        title: `${username} ▶ ${item.app.name}`,
        link: `${appsUrl}/comment-detail/${item.comment.id}`,
        description: art(path.join(__dirname, '../templates/comment.art'), {
            rating: item.score,
            text: item.comment.content,
        }),
        pubDate: timezone(parseDate(item.comment.created_at, 'YYYY-MM-DD'), 8),
        author: username,
    }));

    return {
        title: $('head title').text(),
        link,
        image: decodeURIComponent($('.person div.slot').attr('data-args')).replace('avatar=', '').split('?')[0],
        language: $('html').attr('lang'),
        item: items,
    };
}
