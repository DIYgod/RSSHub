import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['design'],
    example: '/blowstudio',
    name: 'Home',
    maintainers: ['MisteryMonster'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.blowstudio.es';
    const response = await ofetch(`${rootUrl}/work/`);
    const $ = load(response);
    const list = $('.portfolios.normal > ul > li').toArray().slice(0, 10);

    const videostyle = 'width="640" height="360"';
    const imgstyle = 'style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"';

    const items = await Promise.all(
        list.map((item) => {
            const link = `${rootUrl}${$(item).find('a').attr('href')}/`;

            return cache.tryGet(link, async () => {
                const response2 = await ofetch(link);
                const $2 = load(response2);
                const mainvideo = $2('.single-page-vimeo-div').attr('data-video-id');

                let content = `<iframe ${videostyle} src='https://player.vimeo.com/video/${mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
                content += $2('div.portfolio-content > div:nth-child(2)').html();

                for (const img of $2('div.attachment-grid img').toArray()) {
                    content += `<img ${imgstyle} src="${$2(img).attr('src')}"><br>`;
                }

                return {
                    title: $2('div.portfolio-content > div:nth-child(1)').text(),
                    description: content,
                    link,
                };
            });
        })
    );

    return {
        title: 'Blow Studio',
        link: rootUrl,
        item: items,
    };
}
