import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['design'],
    example: '/blur',
    name: 'Works',
    maintainers: ['MisteryMonster'],
    handler,
};

async function handler() {
    const rootUrl = 'http://blur.com';
    const response = await ofetch(rootUrl);
    const $ = load(response);

    const videostyle = 'width="640" height="360"';
    const imgstyle = 'style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"';

    const items = await Promise.all(
        $('.page-title a')
            .toArray()
            .map((item) => {
                const link = $(item).attr('href')!;

                return cache.tryGet(link, async () => {
                    const detailResponse = await ofetch(link);
                    const $2 = load(detailResponse);
                    const mainvideo = $2('div.project-title').attr('data-video');

                    let content = `Client:${$2('div.client').text()}<br>${$2('p').text()}`;
                    content += /\d+/.test(mainvideo ?? '')
                        ? `<iframe ${videostyle} src='https://player.vimeo.com/video/${mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`
                        : `<iframe ${videostyle} src='https://youtube.com/embed/${mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;

                    for (const img of $2('.gridded img').toArray()) {
                        content += `<img ${imgstyle} src="${$2(img).attr('src')}"><br>`;
                    }
                    for (const video of $2('.gridded iframe').toArray()) {
                        content += `<iframe ${videostyle} src='${$2(video).attr('src')}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
                    }

                    return {
                        title: $2('h1.page-title').text(),
                        description: content,
                        link,
                    };
                });
            })
    );

    return {
        title: 'Blur Studio',
        link: rootUrl,
        item: items,
    };
}
