import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import { mobileRootUrl, parseComicPage, rootUrl } from './utils';

export const route: Route = {
    path: '/ac/comic/:id?',
    categories: ['anime'],
    example: '/qq/ac/comic/531490',
    parameters: {
        id: '编号，可在对应页 URL 中找到',
    },
    radar: [
        {
            source: ['ac.qq.com/Comic/ComicInfo/id/:id', 'ac.qq.com/'],
            target: '/ac/comic/:id',
        },
    ],
    name: '漫画',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const currentUrl = `${rootUrl}/Comic/comicInfo/id/${id}`;
    const mobileCurrentUrl = `${mobileRootUrl}/comic/index/id/${id}`;

    const response = await got({
        method: 'get',
        url: mobileCurrentUrl,
    });

    const $ = load(response.data);

    const info = parseComicPage($);
    const items = info.chapters.map((chapter) => ({
        author: info.author,
        title: chapter.title,
        description: chapter.image ? `<img src="${chapter.image}">` : undefined,
        link: chapter.link,
    }));

    return {
        title: `${$('h1').text()} - 腾讯动漫`,
        link: currentUrl,
        item: items,
        description: `<p>${info.description}</p>`,
    };
}
