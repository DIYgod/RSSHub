import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

import { rootUrl, mobileRootUrl } from './utils';

export const route: Route = {
    path: '/ac/comic/:id?',
    radar: [
        {
            source: ['ac.qq.com/Comic/ComicInfo/id/:id', 'ac.qq.com/'],
            target: '/ac/comic/:id',
        },
    ],
    name: 'Unknown',
    maintainers: [],
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

    const author = $('.author-wr')
        .toArray()
        .map((a) => $(a).text().trim())
        .join(', ');

    const items = $('.reverse .bottom-chapter-item .chapter-link')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                author,
                title: item.text(),
                description: `<img src="${item.find('.cover-image').attr('src')}">`,
                link: `${rootUrl}${item.attr('href').replace(/chapter/, 'ComicView')}`,
            };
        });

    return {
        title: `${$('h1').text()} - 腾讯动漫`,
        link: currentUrl,
        item: items,
        description: `<p>${$('.head-info-desc').text()}</p>`,
    };
}
